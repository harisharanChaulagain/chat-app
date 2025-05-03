import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

interface JwtPayload {
  userId: string;
}

const secureRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({ message: "Not Authorized" });
      return;
    }

    const verified = jwt.verify(token, process.env.JWT_TOKEN!) as JwtPayload;

    const user = await User.findById(verified.userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default secureRoute;
