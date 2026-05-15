import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {CallPayload, ICEPayload, TypingPayload,} from "../types/socket.types";

const app = express();
const server = createServer(app);

type UserId = string;
type SocketId = string;

const users = new Map<UserId, SocketId>();
const userDetails = new Map<SocketId, { userId: string; joinedAt: Date }>();

const io = new Server(server, {
  cors: {origin: process.env.FRONTEND_URL || "http://localhost:3000",credentials: true,},
  path: "/socket.io/",
});

export const getReceiverSocketId = (userId: string): string | undefined =>users.get(userId);
export const getOnlineUsers = (): string[] =>Array.from(users.keys());

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
    const targetSocket = getReceiverSocketId(data.userId);
    if (!targetSocket) {
      socket.emit("call_error", {message: "User offline", userId: data.userId,});
      return;
    }
    io.to(targetSocket).emit("incomingCall", {...data,from: userId,timestamp: Date.now(),});
  });

  socket.on(
    "answerCall",
    ({ to, answer, callType }: { to: string; answer: any; callType: string }) => {
      const targetSocket = getReceiverSocketId(to);
      if (targetSocket) {
        io.to(targetSocket).emit("callAccepted", {answer,callType,from: userId,});}
    }
  );

  socket.on("iceCandidate", (payload: ICEPayload & { to: string }) => {
    const targetSocket = getReceiverSocketId(payload.to);
    if (targetSocket) {
      io.to(targetSocket).emit("iceCandidate", {candidate: payload.candidate,from: userId,});
    }
  });

  socket.on(
    "rejectCall",
    ({ to, callType }: { to: string; callType: string }) => {
      const targetSocket = getReceiverSocketId(to);
      if (targetSocket) {io.to(targetSocket).emit("callRejected", {from: userId,callType,});}
    }
  );

  socket.on(
    "endCall",
    ({ to, groupId }: { to?: string; groupId?: string }) => {
      if (to) {
        const targetSocket = getReceiverSocketId(to);
        if (targetSocket) {io.to(targetSocket).emit("callEnded", {from: userId,groupId,});}
      } else if (groupId) {socket.to(`group-call:${groupId}`).emit("callEnded", {from: userId,groupId,});}
    }
  );


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
    users.delete(data.userId);
    userDetails.delete(socket.id);
    io.emit("getonline", getOnlineUsers());
    io.emit("user_status_change", {userId: data.userId,isOnline: false,lastSeen: new Date(),});
    console.log(`User disconnected: ${data.userId}`);
  });
});

export { app, io, server };