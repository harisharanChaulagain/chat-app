import { Request, Response } from "express";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { Types } from "mongoose";
import { getReceiverSocketId, io } from "../socketio/server";

interface AuthenticatedRequest extends Request {
  user: {
    _id: Types.ObjectId;
  };
}

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;

    const user = (req as AuthenticatedRequest).user;
    const senderId = user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id as Types.ObjectId);

    await Promise.all([conversation.save(), newMessage.save()]);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("userTyping", null);
    }

    return res.status(201).json({
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id: chatUser } = req.params;

    const user = (req as AuthenticatedRequest).user;
    const senderId = user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, chatUser] },
    }).populate("messages");

    if (!conversation) {
      return res.status(201).json({ message: "No Conversation found" });
    }

    const message = conversation.messages;
    res.status(201).json({ message, chatUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
  }
};
