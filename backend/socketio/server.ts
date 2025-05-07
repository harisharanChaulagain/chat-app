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

export const getReceiverSocketId = (receiverId: string) => {
  return users[receiverId];
};

const users: { [key: string]: string } = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  const userId = socket.handshake.query.userId;

  if (typeof userId === "string") {
    users[userId] = socket.id;
    console.log("hello", users);
  }

  io.emit("getonline", Object.keys(users));

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    io.emit("getonline", Object.keys(users));
  });

    socket.on("startTyping", (senderId: string) => {
    socket.broadcast.emit("userTyping", senderId);  
  });

  socket.on("stopTyping", (senderId: string) => {
    socket.broadcast.emit("userTyping", null);  
  });
});

export { app, io, server };
