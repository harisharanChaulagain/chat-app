import express from "express";
import {
  blockUser,
  getBlockedUsers,
  getDiscoverFeed,
  getMatches,
  likeProfile,
  passProfile,
  reportUser,
  unblockUser,
  unmatchUser,
} from "../controllers/dating.controller";
import secureRoute from "../middleware/secureRoute";

const router = express.Router();

// Every dating route is for signed-in members only.
router.use(secureRoute);

router.get("/discover", getDiscoverFeed);
router.post("/like/:userId", likeProfile);
router.post("/pass/:userId", passProfile);

router.get("/matches", getMatches);
router.delete("/matches/:userId", unmatchUser);

router.get("/blocked", getBlockedUsers);
router.post("/block/:userId", blockUser);
router.delete("/block/:userId", unblockUser);

router.post("/report/:userId", reportUser);

export default router;
