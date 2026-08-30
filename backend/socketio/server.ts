import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {
  AnswerCallPayload,
  CallEndReason,
  CallPayload,
  CallType,
  EndCallPayload,
  ICEPayload,
  RejectCallPayload,
  TypingPayload,
} from "../types/socket.types";

const app = express();
const server = createServer(app);

type UserId = string;
type SocketId = string;

const users = new Map<UserId, SocketId>();
const userDetails = new Map<SocketId, { userId: string; joinedAt: Date }>();

/** One entry per participant, so either side can be looked up by its own id. */
type CallSession = {
  peerId: UserId;
  callType: CallType;
  accepted: boolean;
  ringTimer?: NodeJS.Timeout;
};
const activeCalls = new Map<UserId, CallSession>();

/** How long a callee is allowed to leave the phone ringing before we give up. */
const RING_TIMEOUT_MS = 45_000;

const io = new Server(server, {
  cors: {origin: process.env.FRONTEND_URL || "http://localhost:3001",credentials: true,},
  path: "/socket.io/",
});

export const getReceiverSocketId = (userId: string): string | undefined =>users.get(userId);
export const getOnlineUsers = (): string[] =>Array.from(users.keys());

const emitToUser = (userId: string, event: string, payload?: unknown): boolean => {
  const socketId = getReceiverSocketId(userId);
  if (socketId) io.to(socketId).emit(event, payload);
  return Boolean(socketId);
};

const forgetCall = (userId: string): void => {
  const session = activeCalls.get(userId);
  if (session?.ringTimer) clearTimeout(session.ringTimer);
  activeCalls.delete(userId);
};

/** Drops both halves of `userId`'s call and tells the peer why it went away. */
const endCallFor = (userId: string, reason: CallEndReason): void => {
  const session = activeCalls.get(userId);
  if (!session) return;

  forgetCall(userId);
  const peerSession = activeCalls.get(session.peerId);
  if (peerSession?.peerId === userId) forgetCall(session.peerId);

  emitToUser(session.peerId, "callEnded", {from: userId,reason,callType: session.callType,});
};

io.on("connection", (socket: Socket) => {
  const userId = socket.handshake.query.userId as string | undefined;
  if (!userId) {socket.disconnect();
    return;
  }
  users.set(userId, socket.id);
  userDetails.set(socket.id, {userId,joinedAt: new Date(),});
  socket.join(`user:${userId}`);
  io.emit("getonline", getOnlineUsers());
  io.emit("user_status_change", {userId,isOnline: true,lastSeen: null,});
  console.log(`User connected: ${userId}`);
  socket.on("join_chat", (roomId: string) => {socket.join(`chat:${roomId}`);});
  socket.on("leave_chat", (roomId: string) => {socket.leave(`chat:${roomId}`);});
  socket.on("typing", (payload: TypingPayload) => {
    const receiverSocketId = getReceiverSocketId(payload.receiverId);
    if (receiverSocketId) {io.to(receiverSocketId).emit("userTyping", {userId,...payload,});}
  });

  socket.on("mark_read", ({ conversationId }: { conversationId: string }) => {
    socket.to(`chat:${conversationId}`).emit("messages_read", {readBy: userId,conversationId,});
  });

  socket.on("initiateCall", (data: CallPayload) => {
    const calleeId = data.userId;
    if (!calleeId || calleeId === userId) return;

    if (!getReceiverSocketId(calleeId)) {
      socket.emit("callRejected", {from: calleeId,callType: data.callType,reason: "offline",});
      socket.emit("call_error", {message: "User offline", userId: calleeId,});
      return;
    }

    if (activeCalls.has(calleeId)) {
      socket.emit("callRejected", {from: calleeId,callType: data.callType,reason: "busy",});
      return;
    }

    // The caller may be retrying from a stale call — release it before claiming a new one.
    endCallFor(userId, "cancelled");

    activeCalls.set(calleeId, {peerId: userId,callType: data.callType,accepted: false,});
    activeCalls.set(userId, {
      peerId: calleeId,
      callType: data.callType,
      accepted: false,
      ringTimer: setTimeout(() => {
        const session = activeCalls.get(userId);
        if (!session || session.accepted || session.peerId !== calleeId) return;
        forgetCall(userId);
        if (activeCalls.get(calleeId)?.peerId === userId) forgetCall(calleeId);
        emitToUser(userId, "callEnded", {from: calleeId,reason: "unanswered",callType: data.callType,});
        emitToUser(calleeId, "callEnded", {from: userId,reason: "unanswered",callType: data.callType,});
      }, RING_TIMEOUT_MS),
    });

    io.to(getReceiverSocketId(calleeId)!).emit("incomingCall", {
      from: userId,
      fromName: data.fromName,
      callType: data.callType,
      offer: data.offer,
      isGroupCall: data.isGroupCall ?? false,
      groupId: data.groupId ?? null,
      timestamp: Date.now(),
    });
  });

  socket.on("answerCall", ({ to, answer, callType }: AnswerCallPayload) => {
    const session = activeCalls.get(userId);
    if (!session || session.peerId !== to) return;

    forgetCall(userId);
    activeCalls.set(userId, {peerId: to,callType: session.callType,accepted: true,});
    const peerSession = activeCalls.get(to);
    if (peerSession?.peerId === userId) {
      forgetCall(to);
      activeCalls.set(to, {peerId: userId,callType: peerSession.callType,accepted: true,});
    }

    emitToUser(to, "callAccepted", {answer,callType: callType ?? session.callType,from: userId,});
  });

  socket.on("iceCandidate", (payload: ICEPayload) => {
    const targetSocket = getReceiverSocketId(payload.to);
    if (targetSocket) {
      io.to(targetSocket).emit("iceCandidate", {candidate: payload.candidate,from: userId,});
    }
  });

  socket.on("rejectCall", ({ to, callType, reason }: RejectCallPayload) => {
    const session = activeCalls.get(userId);
    forgetCall(userId);
    if (activeCalls.get(to)?.peerId === userId) forgetCall(to);
    emitToUser(to, "callRejected", {from: userId,callType: callType ?? session?.callType,reason: reason ?? "rejected",});
  });

  socket.on("endCall", ({ to, groupId, reason }: EndCallPayload) => {
    if (to) {
      const session = activeCalls.get(userId);
      forgetCall(userId);
      if (activeCalls.get(to)?.peerId === userId) forgetCall(to);
      emitToUser(to, "callEnded", {from: userId,groupId,reason: reason ?? "hangup",callType: session?.callType,});
    } else if (groupId) {socket.to(`group-call:${groupId}`).emit("callEnded", {from: userId,groupId,reason: reason ?? "hangup",});}
  });


  socket.on(
    "join_group_call",
    ({ groupId }: { groupId: string }) => {
      socket.join(`group-call:${groupId}`);
      socket.to(`group-call:${groupId}`).emit("user_joined_call", {userId, imestamp: Date.now(),});}
  );

  socket.on("leave_group_call", ({ groupId }: { groupId: string }) => {
    socket.leave(`group-call:${groupId}`);
    socket.to(`group-call:${groupId}`).emit("user_left_call", {userId,});
  });

  socket.on("disconnect", () => {
    const data = userDetails.get(socket.id);
    if (!data) return;
    userDetails.delete(socket.id);
    // A second tab may have taken over this userId already — don't evict the live socket.
    if (users.get(data.userId) !== socket.id) return;
    users.delete(data.userId);
    endCallFor(data.userId, "disconnected");
    io.emit("getonline", getOnlineUsers());
    io.emit("user_status_change", {userId: data.userId,isOnline: false,lastSeen: new Date(),});
    console.log(`User disconnected: ${data.userId}`);
  });
});

export { app, io, server };
