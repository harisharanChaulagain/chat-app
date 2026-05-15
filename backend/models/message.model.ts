import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId; 
  groupId: Types.ObjectId; 
  message: string;
  messageType: "text" | "image" | "video" | "file";
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
      enum: ["text", "image", "video", "file"],
      default: "text",
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
