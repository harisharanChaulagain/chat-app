import { Request, Response } from "express";
import User from "../models/user.model";
import followModel from "../models/follow.model";

export const getFriendProfile = async (
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

    const loggedInUserId = user._id;

    const [following, followers] = await Promise.all([
      followModel
        .find({
          followerId: loggedInUserId,
          status: "accepted",
        })
        .select("followingId")
        .lean(),

      followModel
        .find({
          followingId: loggedInUserId,
          status: "accepted",
        })
        .select("followerId")
        .lean(),
    ]);

    const followerIds = new Set(
      followers.map((f) => f.followerId.toString())
    );

    const friendIds = following
      .filter((f) => followerIds.has(f.followingId.toString()))
      .map((f) => f.followingId);

    const friends = await User.find({
      _id: { $in: friendIds },
    })
      .select("-password")
      .lean();

    res.status(200).json({
      success: true,
      count: friends.length,
      friends,
    });
  } catch (error) {
    console.error("Get Friend Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};