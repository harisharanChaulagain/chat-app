import express, { Request, Response, NextFunction,} from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.route";
import messageRoute from "./routes/message.route";
import followRoutes from "./routes/follow.routes";
import groupRoutes from "./routes/group.routes";
import { app, server } from "./socketio/server";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;
const FRONTEND_URL: string =process.env.FRONTEND_URL || "http://localhost:3000";
if (!MONGODB_URI) {throw new Error("MONGODB_URI is not defined in .env");}

app.use(
  cors({origin: FRONTEND_URL,credentials: true,})
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Database Connected!"))
  .catch((err: Error) =>
    console.error("Database connection error:", err.message)
  );

app.use("/api/user", userRouter);
app.use("/api/message", messageRoute);
app.use("/api/follow", followRoutes);
app.use("/api/group", groupRoutes);

app.get(
  "/api/health",
  (req: Request, res: Response): void => {
    res.json({ status: "OK", timestamp: new Date().toISOString(), uptime: process.uptime(),});}
);

app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error("Global error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,});
  }
);

server.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Socket.IO: ws://localhost:${PORT}`);
});