import { Request, Response } from "express";
import Follow from "../models/follow.model";
import User from "../models/user.model";
import Conversation from "../models/conversation.model";
import { getReceiverSocketId, io } from "../socketio/server";

export const followUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const { userId: followingId } = req.params;
    const followerId = user._id;
    
    if (followerId.toString() === followingId) {
      res.status(400).json({ message: "Cannot follow yourself" });
      return;
    }
    
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
      res.status(400).json({ message: "Already following this user" });
      return;
    }
    
    const reverseFollow = await Follow.findOne({ 
      followerId: followingId, 
      followingId: followerId, 
      status: "pending" 
    });
    
    let status: "pending" | "accepted" = "pending";
    let conversation = null;
    
    if (reverseFollow) {
      status = "accepted";
      await Follow.updateOne(
        { followerId: followingId, followingId: followerId },
        { status: "accepted", acceptedAt: new Date() }
      );
      
      conversation = await Conversation.create({ 
        participants: [followerId, followingId],
        messages: [],
        type: "direct", 
        lastMessageAt: new Date(),
      });
      
      const followerSocketId = getReceiverSocketId(followerId.toString());
      const followingSocketId = getReceiverSocketId(followingId.toString());
      
      if (followerSocketId) {
        io.to(followerSocketId).emit("follow_accepted", { 
          userId: followingId, 
          conversationId: conversation._id, 
          username: userToFollow.name 
        });
      }
      
      if (followingSocketId) {
        io.to(followingSocketId).emit("follow_accepted", { 
          userId: followerId, 
          conversationId: conversation._id, 
          username: user.name 
        });
      }
    }
    
    const follow = await Follow.create({
      followerId,
      followingId,
      status,
      acceptedAt: status === "accepted" ? new Date() : null,
    });
    
    const receiverSocketId = getReceiverSocketId(followingId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new_follow_request", {
        followerId,
        followerName: user.name,
        followId: follow._id,
      });
    }
    
    res.status(201).json({
      message: status === "accepted" ? "Mutual follow established!" : "Follow request sent",
      follow,
      conversation,
      isMutual: status === "accepted",
    });
  } catch (error: unknown) {
    console.error("Follow user error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Server error" 
    });
  }
};