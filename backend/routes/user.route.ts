import express from "express";
import {
  registerUser,
  loginUser,
  logout,
} from "../controllers/user.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);


export default router;
