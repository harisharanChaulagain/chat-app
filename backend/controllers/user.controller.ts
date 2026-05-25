import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { loginSchema, userRegister } from "../validation/user.validation";
import createTokenAndSaveCookie from "../jwt/generateToken";
import followModel from "../models/follow.model";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const parseResult = userRegister.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ errors: parseResult.error.flatten() });
    return;
  }
  const { name, email, password } = parseResult.data;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    createTokenAndSaveCookie(newUser._id.toString(), res);
    res.status(201).json({
      message: "User registered successfully",
      user: { _id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ errors: parseResult.error.flatten() });
    return;
  }
  const { email, password } = parseResult.data;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    createTokenAndSaveCookie(user._id.toString(), res);
    res.status(200).json({
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAuthenticatedUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    
    const userId = user._id;
    const userData = await User.findById(userId).select("-password");
    
    if (!userData) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (
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

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    const follows = await followModel.find({
      $or: [
        { followerId: loggedInUserId },
        { followingId: loggedInUserId },
      ],
    });

    const allUsers = users.map((singleUser) => {
      const sentFollow = follows.find(
        (f) =>
          f.followerId.toString() ===
            loggedInUserId.toString() &&
          f.followingId.toString() ===
            singleUser._id.toString()
      );

      const receivedFollow = follows.find(
        (f) =>
          f.followerId.toString() ===
            singleUser._id.toString() &&
          f.followingId.toString() ===
            loggedInUserId.toString()
      );

      let followStatus = "follow";

      if (sentFollow) {
        if (sentFollow.status === "pending") {
          followStatus = "requested";
        }

        if (sentFollow.status === "accepted") {
          followStatus = "following";
        }
      }

      else if (receivedFollow) {
        followStatus = "followBack";
      }

      return {
        ...singleUser.toObject(),
        followStatus,
      };
    });

    res.status(200).json({
      allUsers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};