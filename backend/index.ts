import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import messageRoute from "./routes/message.route";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env");
}

mongoose
  .connect(MONGODB_URI!)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use(express.json());
app.use(cookieParser());

app.use(
  "/api/user",
  (req, res, next) => {
    console.log("User route accessed!");
    next();
  },
  userRouter
);
app.use(
  "/api/message",
  (req, res, next) => {
    console.log("Message route accessed!");
    next();
  },
  messageRoute
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
