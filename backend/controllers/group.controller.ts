import { Request, Response } from "express";
import { Types } from "mongoose";
import Group from "../models/group.model";
import Conversation from "../models/conversation.model";
import Message from "../models/message.model";
import { getReceiverSocketId, io } from "../socketio/server";
import { CreateGroupBody, AddMembersBody, PaginationQuery } from "../types/group.types";

export const createGroup = async (req: Request<{}, {}, CreateGroupBody>, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { name, description, memberIds } = req.body;
    const members = [...new Set([userId.toString(), ...memberIds])];
    
    const group = await Group.create({
      name,
      description,
      createdBy: userId,
      members,
      isActive: true,
    });
    
    const conversation = await Conversation.create({
      participants: members,
      messages: [],
      type: "group",
      groupId: group._id,
      lastMessageAt: new Date(),
    });
    
    await group.populate("createdBy", "name email");
    
    members.forEach((memberId: string) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) {
        io.to(socketId).emit("group_created", {
          group,
          conversationId: conversation._id,
        });
      }
    });
    
    res.status(201).json({
      message: "Group created successfully",
      group,
      conversation,
    });
  } catch (error: unknown) {
    console.error("Create group error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const groups = await Group.find({
      members: userId,
      isActive: true,
    })
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 });
    
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        const conversation = await Conversation.findOne({ groupId: group._id });
        if (!conversation?.lastMessage) return group;
        
        const lastMessage = await Message.findById(conversation.lastMessage).populate("senderId", "name");
        return { ...group.toObject(), lastMessage };
      })
    );
    
    res.json(enrichedGroups);
  } catch (error: unknown) {
    console.error("Get groups error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const addMembersToGroup = async (req: Request<{ groupId: string }, {}, AddMembersBody>, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { groupId } = req.params;
    const { memberIds } = req.body;
    
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }
    
    if (group.createdBy.toString() !== userId.toString()) {
      res.status(403).json({ message: "Only creator can add members" });
      return;
    }
    
    const newMembers = memberIds.filter((id) => !group.members.some((m) => m.toString() === id));
    group.members.push(...newMembers.map((id) => new Types.ObjectId(id)));
    await group.save();
    
    await Conversation.findOneAndUpdate(
      { groupId: group._id },
      { $addToSet: { participants: { $each: newMembers } } }
    );
    
    newMembers.forEach((memberId: string) => {
      const socketId = getReceiverSocketId(memberId);
      if (socketId) {
        io.to(socketId).emit("added_to_group", {
          groupId: group._id,
          groupName: group.name,
          addedBy: userId,
        });
      }
    });
    
    res.json({ message: "Members added successfully", group });
  } catch (error: unknown) {
    console.error("Add members error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const leaveGroup = async (req: Request<{ groupId: string }>, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }
    
    group.members = group.members.filter((m: Types.ObjectId) => m.toString() !== userId.toString());
    await group.save();
    
    await Conversation.findOneAndUpdate(
      { groupId: group._id },
      { $pull: { participants: userId } }
    );
    
    group.members.forEach((memberId: Types.ObjectId) => {
      const socketId = getReceiverSocketId(memberId.toString());
      if (socketId) {
        io.to(socketId).emit("member_left_group", {
          groupId: group._id,
          userId,
          username: user.name,
        });
      }
    });
    
    res.json({ message: "Left group successfully" });
  } catch (error: unknown) {
    console.error("Leave group error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getGroupMessages = async (req: Request<{ groupId: string }, {}, {}, PaginationQuery>, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const page = Number(req.query.page || 0);
    const limit = Number(req.query.limit || 50);
    
    const conversation = await Conversation.findOne({ groupId });
    
    if (!conversation) {
      res.status(404).json({ message: "Conversation not found" });
      return;
    }
    
    const messages = await Message.find({ _id: { $in: conversation.messages } })
      .populate("senderId", "name email")
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    
    const total = conversation.messages.length;
    
    res.json({
      messages: messages.reverse(),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    console.error("Get group messages error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};