import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { loginSchema, userRegister } from "../validation/user.validation";
import { datingProfileSchema } from "../validation/dating.validation";
import { selfProfile } from "../services/dating.service";
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

    res.status(200).json({ user: selfProfile(userData) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Edits the signed-in member's dating profile. Every field is optional, so the
 * profile page can save one section at a time without clobbering the rest.
 */
export const updateMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const parsed = datingProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid profile",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const input = parsed.data;

    // Whichever half of the age range was left out keeps its stored value, so a
    // one-sided edit cannot quietly invert the window.
    const ageMin = input.ageMin ?? user.ageMin;
    const ageMax = input.ageMax ?? user.ageMax;
    if (ageMin > ageMax) {
      res
        .status(400)
        .json({ message: "Maximum age must be at least the minimum" });
      return;
    }

    const updates: Record<string, unknown> = {};

    if (input.name !== undefined) updates.name = input.name;
    if (input.bio !== undefined) updates.bio = input.bio;
    if (input.city !== undefined) updates.city = input.city;
    if (input.country !== undefined) updates.country = input.country;
    if (input.gender !== undefined) updates.gender = input.gender;
    if (input.intent !== undefined) updates.intent = input.intent;
    if (input.preference !== undefined) updates.preference = input.preference;
    if (input.ageMin !== undefined) updates.ageMin = input.ageMin;
    if (input.ageMax !== undefined) updates.ageMax = input.ageMax;
    if (input.photos !== undefined) updates.photos = input.photos;

    if (input.birthDate !== undefined) {
      updates.birthDate = input.birthDate ? new Date(input.birthDate) : null;
    }

    if (input.interests !== undefined) {
      // Same interest twice, differently cased, is still the same interest.
      const seen = new Set<string>();
      updates.interests = input.interests.filter((interest) => {
        const key = interest.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated",
      user: selfProfile(updated),
    });
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