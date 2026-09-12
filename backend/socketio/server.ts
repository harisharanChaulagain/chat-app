import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {
  AnswerCallPayload,
  CallEndReason,
  CallOutcome,
  CallPayload,
  CallType,
  EndCallPayload,
  ICEPayload,
  RejectCallPayload,
  TypingPayload,
} from "../types/socket.types";
import { recordCallLog } from "../services/callLog.service";

const app = express();
const server = createServer(app);

type UserId = string;
type SocketId = string;

const users = new Map<UserId, SocketId>();
const userDetails = new Map<SocketId, { userId: string; joinedAt: Date }>();

/**
 * One session object per call, referenced from BOTH participants' keys in
 * `activeCalls`. Sharing the object (rather than storing a copy per user) is
 * what makes the `logged` guard reliable: a call can terminate through several
 * paths at once — hanging up and closing the tab fires both `endCall` and
 * `disconnect` — and whichever runs first must be visible to the rest.
 */
type CallSession = {
  /** Who dialled. Becomes the log message's senderId. */
  callerId: UserId;
  calleeId: UserId;
  callType: CallType;
  accepted: boolean;
  /** Set when the callee's answer arrives; the basis for duration. */
  connectedAt?: number;
  /** Set once the history entry has been written, so it is written only once. */
  logged: boolean;
  ringTimer?: NodeJS.Timeout;
};
const activeCalls = new Map<UserId, CallSession>();

/** How long a callee is allowed to leave the phone ringing before we give up. */
const RING_TIMEOUT_MS = 45_000;

const io = new Server(server, {
  cors: {origin: process.env.FRONTEND_URL || "http://localhost:3000",credentials: true,},
  path: "/socket.io/",
});

export const getReceiverSocketId = (userId: string): string | undefined =>users.get(userId);
export const getOnlineUsers = (): string[] =>Array.from(users.keys());

const emitToUser = (userId: string, event: string, payload?: unknown): boolean => {
  const socketId = getReceiverSocketId(userId);
  if (socketId) io.to(socketId).emit(event, payload);
  return Boolean(socketId);
};

/** Classifies a call for the history entry both participants will see. */
const deriveOutcome = (
  session: CallSession,
  endedBy: UserId | null,
  reason: CallEndReason
): CallOutcome => {
  // Media was flowing, so the call happened regardless of how it stopped.
  if (session.accepted) return "completed";

  if (reason === "rejected") return "declined";
  if (reason === "failed" || reason === "media-denied") return "failed";
  if (reason === "unanswered") return "missed";

  // Never answered and the caller walked away — a cancel to them, a miss to the
  // callee. The two readings are resolved per-viewer on the client.
  if (endedBy === session.callerId) return "cancelled";
  return "missed";
};

/**
 * Writes the history entry and pushes it to both participants.
 *
 * Neither side made an HTTP request here, so unlike `sendMessage` — where the
 * sender gets its copy back in the response — both peers need the socket event.
 */
const persistAndBroadcast = async (
  session: CallSession,
  endedBy: UserId | null,
  reason: CallEndReason
): Promise<void> => {
  const outcome = deriveOutcome(session, endedBy, reason);
  const duration = session.connectedAt
    ? Math.max(0, Math.round((Date.now() - session.connectedAt) / 1000))
    : 0;

  const logged = await recordCallLog({
    callerId: session.callerId,
    calleeId: session.calleeId,
    callType: session.callType,
    outcome,
    duration,
    endReason: reason,
  });

  if (!logged) return;

  emitToUser(session.callerId, "newMessage", logged);
  emitToUser(session.calleeId, "newMessage", logged);
};

/**
 * The single exit from an active call: releases both halves of the session and
 * records it. Safe to call repeatedly and from any termination path.
 */
const concludeCall = (
  session: CallSession,
  endedBy: UserId | null,
  reason: CallEndReason
): void => {
  if (session.logged) return;
  session.logged = true;

  if (session.ringTimer) clearTimeout(session.ringTimer);
  activeCalls.delete(session.callerId);
  activeCalls.delete(session.calleeId);

  void persistAndBroadcast(session, endedBy, reason);
};

/** The other participant, from either side of the session. */
const peerOf = (session: CallSession, userId: UserId): UserId =>
  session.callerId === userId ? session.calleeId : session.callerId;

/** `userId`'s live session with `peerId`, or undefined if that is not the call they are in. */
const sessionWith = (
  userId: UserId,
  peerId: UserId | undefined
): CallSession | undefined => {
  const session = activeCalls.get(userId);
  if (!session) return undefined;
  if (peerId && peerOf(session, userId) !== peerId) return undefined;
  return session;
};

/** Drops `userId`'s call, if any, and tells the peer why it went away. */
const endCallFor = (userId: string, reason: CallEndReason): void => {
  const session = activeCalls.get(userId);
  if (!session) return;

  const peerId = peerOf(session, userId);
  concludeCall(session, userId, reason);

  emitToUser(peerId, "callEnded", {from: userId,reason,callType: session.callType,});
};

/**
 * A call attempt that never became a session — the callee was offline or busy.
 * Still worth recording: being unreachable is the most useful missed call there
 * is, and it is the only way the callee learns the attempt happened.
 */
const logUnreachableAttempt = (
  callerId: UserId,
  calleeId: UserId,
  callType: CallType,
  reason: CallEndReason
): void => {
  void persistAndBroadcast(
    {
      callerId,
      calleeId,
      callType,
      accepted: false,
      logged: true,
      connectedAt: undefined,
    },
    null,
    reason
  );
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
      logUnreachableAttempt(userId, calleeId, data.callType, "offline");
      return;
    }

    if (activeCalls.has(calleeId)) {
      socket.emit("callRejected", {from: calleeId,callType: data.callType,reason: "busy",});
      logUnreachableAttempt(userId, calleeId, data.callType, "busy");
      return;
    }

    // The caller may be retrying from a stale call — release it before claiming a new one.
    endCallFor(userId, "cancelled");

    const session: CallSession = {
      callerId: userId,
      calleeId,
      callType: data.callType,
      accepted: false,
      logged: false,
      ringTimer: setTimeout(() => {
        const current = activeCalls.get(userId);
        if (current !== session || session.accepted) return;
        concludeCall(session, null, "unanswered");
        emitToUser(userId, "callEnded", {from: calleeId,reason: "unanswered",callType: data.callType,});
        emitToUser(calleeId, "callEnded", {from: userId,reason: "unanswered",callType: data.callType,});
      }, RING_TIMEOUT_MS),
    };

    activeCalls.set(userId, session);
    activeCalls.set(calleeId, session);

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
    if (!session || session.calleeId !== userId || session.callerId !== to) return;

    if (session.ringTimer) {
      clearTimeout(session.ringTimer);
      session.ringTimer = undefined;
    }
    session.accepted = true;
    session.connectedAt = Date.now();

    emitToUser(to, "callAccepted", {answer,callType: callType ?? session.callType,from: userId,});
  });

  socket.on("iceCandidate", (payload: ICEPayload) => {
    const targetSocket = getReceiverSocketId(payload.to);
    if (targetSocket) {
      io.to(targetSocket).emit("iceCandidate", {candidate: payload.candidate,from: userId,});
    }
  });

  socket.on("rejectCall", ({ to, callType, reason }: RejectCallPayload) => {
    const session = sessionWith(userId, to);
    if (session) concludeCall(session, userId, reason ?? "rejected");
    emitToUser(to, "callRejected", {from: userId,callType: callType ?? session?.callType,reason: reason ?? "rejected",});
  });

  socket.on("endCall", ({ to, groupId, reason }: EndCallPayload) => {
    if (to) {
      const session = sessionWith(userId, to);
      if (session) concludeCall(session, userId, reason ?? "hangup");
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
