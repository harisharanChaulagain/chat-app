import express from "express";

import secureRoute from "../middleware/secureRoute";

import {
  followUser,
  cancelFollowRequest,
  unfollowUser,
} from "../controllers/follow.controller";

const router = express.Router();

router.use(secureRoute);

router.post("/:userId", followUser);
router.delete("/cancel/:userId", cancelFollowRequest);
router.delete("/unfollow/:userId", unfollowUser);

export default router;
