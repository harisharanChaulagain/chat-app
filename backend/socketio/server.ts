import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const users: { [key: string]: string } = {};

// Helper to get receiver's socket id
export const getReceiverSocketId = (receiverId: string) => users[receiverId];

io.on("connection", (socket) => {

  const userId = socket.handshake.query.userId;

  if (typeof userId === "string" && userId.trim() !== "") {
    users[userId] = socket.id;
  } else {
    console.warn("Invalid or missing userId on connection");
  }

  // Emit updated online users to all clients
  // io.emit("getonline", Object.keys(users));
  io.emit("getonline", users);

  // WebRTC signaling events

  socket.on("initiateCall", ({ userId, offer, myId, callType, fromName }) => {
    io.to(userId).emit("incomingCall", {
      offer,
      from: myId,
      callType,
      fromName,
    });
  });

  socket.on("answerCall", ({ to, answer }) => {
    io.to(to).emit("callAccepted", answer);
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    io.to(to).emit("iceCandidate", candidate);
  });

  socket.on("endCall", ({ to }) => {
    io.to(to).emit("callEnded");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

export { app, io, server };
