import { Request, Response } from "express";
import { Types } from "mongoose";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import Follow from "../models/follow.model";
import Group from "../models/group.model";
import { getReceiverSocketId, io } from "../socketio/server";

type MessageType = "text" | "image" | "video" | "audio" | "file";

interface SendMessageBody {
  message: string;
  messageType?: MessageType;
  attachments?: string[];
  replyTo?: string | null;
}

interface GetMessageQuery {
  page?: string;
  limit?: string;
  isGroup?: string;
}

const canChatDirectly = async (userId1: Types.ObjectId, userId2: Types.ObjectId | string): Promise<boolean> => {
  const follow1 = await Follow.findOne({followerId: userId1, followingId: userId2, status: "accepted"});
  const follow2 = await Follow.findOne({followerId: userId2, followingId: userId1, status: "accepted"});
  return Boolean(follow1 && follow2);
};

export const sendMessage = async (req: Request<{ id: string; isGroup?: string }, unknown, SendMessageBody>, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const senderId = user?._id;
    
    if (!senderId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { message, messageType = "text", attachments = [], replyTo = null } = req.body;
    const { id: receiverId } = req.params;
    let isGroupMessage = false;
    let group = null;
    
    if (req.params.isGroup) {
      group = await Group.findById(receiverId);
      if (group) isGroupMessage = true;
    }

    if (!isGroupMessage) {
      const canChat = await canChatDirectly(senderId, receiverId);
      if (!canChat) {
        res.status(403).json({ message: "You can only chat with mutual followers" });
        return;
      }
    }

    let conversation;
    if (isGroupMessage) {
      conversation = await Conversation.findOne({ groupId: group?._id, type: "group" });
    } else {
      conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] }, type: "direct" });
    }
    
    if (!conversation && isGroupMessage) {
      res.status(404).json({ message: "Group conversation not found" });
      return;
    }
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
        type: "direct",
        lastMessageAt: new Date(),
      });
    }
    
    const newMessage = new Message({
      senderId,
      receiverId: isGroupMessage ? null : receiverId,
      groupId: isGroupMessage ? group?._id : null,
      message,
      messageType,
      attachments,
      replyTo: replyTo || null,
      isRead: false,
      readBy: [],
    });
    
    conversation.messages.push(newMessage._id);
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = new Date();

    await Promise.all([conversation.save(), newMessage.save()]);
    await newMessage.populate("senderId", "name email");
    
    if (isGroupMessage && group) {
      group.members.forEach((memberId: Types.ObjectId) => {
        const socketId = getReceiverSocketId(memberId.toString());
        if (socketId && memberId.toString() !== senderId.toString()) {
          io.to(socketId).emit("newGroupMessage", {
            message: newMessage,
            groupId: group._id,
            conversationId: conversation._id,
          });
        }
      });
    } else {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        io.to(receiverSocketId).emit("userTyping", null);
      }
    }

    res.status(201).json({
      message: "Message sent successfully",
      newMessage,
      conversationId: conversation._id,
    });
  } catch (error: unknown) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
  }
};

export const getMessage = async (req: Request<{ id: string }, unknown, unknown, GetMessageQuery>, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const senderId = user?._id;

    if (!senderId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { id: chatUser } = req.params;
    const { page = "0", limit = "50", isGroup = "false" } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    
    let conversation;
    if (isGroup === "true") {
      conversation = await Conversation.findOne({ groupId: chatUser, type: "group" });
    } else {
      conversation = await Conversation.findOne({ participants: { $all: [senderId, chatUser] }, type: "direct" });
    }

    if (!conversation) {
      res.status(200).json({ messages: [], total: 0, message: "No conversation found" });
      return;
    }

    const totalMessages = conversation.messages.length;
    const totalPages = Math.ceil(totalMessages / limitNumber);

    const messages = await Message.find({ _id: { $in: conversation.messages } })
      .populate("senderId", "name email")
      .sort({ createdAt: -1 })
      .skip(pageNumber * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      messages: messages.reverse(),
      currentPage: pageNumber,
      totalPages,
      totalMessages,
      hasNextPage: pageNumber < totalPages - 1,
      hasPrevPage: pageNumber > 0,
      conversationId: conversation._id,
    });
  } catch (error: unknown) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
  }
};

export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      res.status(404).json({ message: "Conversation not found" });
      return;
    }
    
    const unreadMessages = await Message.find({
      _id: { $in: conversation.messages },
      senderId: { $ne: userId },
      isRead: false,
    });
    
    const messageIds = unreadMessages.map((m) => m._id);
    
    if (messageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        {
          isRead: true,
          $addToSet: { readBy: { userId, readAt: new Date() } },
        }
      );
    }
    
    res.json({ message: "Messages marked as read", count: messageIds.length });
  } catch (error: unknown) {
    console.error("Mark messages read error:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    
    if (message.senderId.toString() !== userId.toString()) {
      res.status(403).json({ message: "Can only delete your own messages" });
      return;
    }
    
    message.isDeleted = true;
    message.message = "[Message deleted]";
    await message.save();
    
    const conversation = await Conversation.findOne({ messages: messageId });
    
    if (conversation) {
      conversation.participants.forEach((p: Types.ObjectId) => {
        const socketId = getReceiverSocketId(p.toString());
        if (socketId) {
          io.to(socketId).emit("message_deleted", {
            messageId,
            conversationId: conversation._id,
          });
        }
      });
    }
    
    res.json({ message: "Message deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
  }
};