import jwt from "jsonwebtoken";
import { Response } from "express"; 

 const createTokenAndSaveCookie = (userId: string, res: Response) => {
  const token = jwt.sign({ userId }, process.env.JWT_TOKEN as string, {
    expiresIn: "5d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true, 
    sameSite: "strict",
    maxAge: 5 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default createTokenAndSaveCookie;