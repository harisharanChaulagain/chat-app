import express from "express";
import {
  createGroup,
  getGroups,
  addMembersToGroup,
  leaveGroup,
  getGroupMessages
} from "../controllers/group.controller";
import secureRoute from "../middleware/secureRoute";

const router = express.Router();

router.use(secureRoute);

router.post("/groups", createGroup);
router.get("/groups", getGroups);
router.post("/groups/:groupId/members", addMembersToGroup);
router.delete("/groups/:groupId/leave", leaveGroup);
router.get("/groups/:groupId/messages", getGroupMessages);

export default router;