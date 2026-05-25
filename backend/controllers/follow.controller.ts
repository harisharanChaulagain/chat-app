import { Request, Response } from "express";
import Follow from "../models/follow.model";
import User from "../models/user.model";
import Conversation from "../models/conversation.model";
import { getReceiverSocketId, io } from "../socketio/server";

export const followUser = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      status: {
        $in: ["pending", "accepted"],
      },
    });

    let status: "pending" | "accepted" = "pending";

    let conversation = null;

    if (reverseFollow) {
      status = "accepted";

      // Only update if reverse request was pending
      if (reverseFollow.status === "pending") {
        await Follow.updateOne(
          {
            followerId: followingId,
            followingId: followerId,
          },
          {
            status: "accepted",
            acceptedAt: new Date(),
          }
        );
      }

      // Create conversation only if doesn't exist
      const existingConversation = await Conversation.findOne({
        participants: {
          $all: [followerId, followingId],
        },
        type: "direct",
      });

      if (!existingConversation) {
        conversation = await Conversation.create({
          participants: [followerId, followingId],
          messages: [],
          type: "direct",
          lastMessageAt: new Date(),
        });
      } else {
        conversation = existingConversation;
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
      message:
        status === "accepted"
          ? "Mutual follow established!"
          : "Follow request sent",
      follow,
      conversation,
      isMutual: status === "accepted",
    });
  } catch (error: unknown) {
    console.error("Follow user error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const cancelFollowRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;

    const followerId = user._id;

    const { userId: followingId } = req.params;

    const follow = await Follow.findOne({
      followerId,
      followingId,
      status: "pending",
    });

    if (!follow) {
      res.status(404).json({
        message: "Follow request not found",
      });

      return;
    }

    await Follow.deleteOne({
      _id: follow._id,
    });

    res.status(200).json({
      message: "Follow request cancelled",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const unfollowUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
      });

      return;
    }

    const followerId = user._id;

    const { userId: followingId } = req.params;

    const follow = await Follow.findOne({
      followerId,
      followingId,
      status: "accepted",
    });

    if (!follow) {
      res.status(404).json({
        message: "Follow relationship not found",
      });

      return;
    }

    await Follow.deleteOne({
      _id: follow._id,
    });

    res.status(200).json({
      message: "Unfollowed successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
