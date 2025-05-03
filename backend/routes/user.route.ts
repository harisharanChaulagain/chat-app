import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  getUserProfile,
} from "../controllers/user.controller";
import secureRoute from "../middleware/secureRoute"

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/getUserProfile",secureRoute, getUserProfile)


export default router;
