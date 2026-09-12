import mongoose, { Document, Schema, Types } from "mongoose";
import { CallLogInfo } from "../types/socket.types";

/** Metadata for a `messageType: "call"` entry — the thread's record of a call. */
export type ICallInfo = CallLogInfo;

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  groupId: Types.ObjectId;
  message: string;
  messageType: "text" | "image" | "video" | "audio" | "file" | "call";
  callInfo?: ICallInfo;
  attachments: Array<{
    type: string;
    url: string;
    thumbnail?: string;
    size?: number;
    name?: string;
  }>;
  isRead: boolean;
  readBy: Array<{ userId: Types.ObjectId; readAt: Date }>;
  replyTo: Types.ObjectId;
  isDeleted: boolean;
}

/** `_id: false` — this never needs addressing on its own, it is part of the message. */
const callInfoSchema = new Schema<ICallInfo>(
  {
    callType: {
      type: String,
      enum: ["audio", "video"],
      required: true,
    },
    outcome: {
      type: String,
      enum: ["completed", "missed", "declined", "cancelled", "failed"],
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    endReason: {
      type: String,
    },
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "call"],
      default: "text",
    },
    // `default: undefined` keeps this absent on non-call messages — a plain
    // nested path would materialise as an empty object on every text message.
    callInfo: {
      type: callInfoSchema,
      default: undefined,
    },
    attachments: [
      {
        type: { type: String },
        url: { type: String },
        thumbnail: { type: String },
        size: { type: Number },
        name: { type: String },
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ chatRoomId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
