import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  getUserProfile,
  getAuthenticatedUserProfile,
  updateMyProfile,
} from "../controllers/user.controller";
import secureRoute from "../middleware/secureRoute";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/profile", secureRoute, getAuthenticatedUserProfile);
router.patch("/profile", secureRoute, updateMyProfile);
router.get("/getUserProfile", secureRoute, getUserProfile);

export default router;
