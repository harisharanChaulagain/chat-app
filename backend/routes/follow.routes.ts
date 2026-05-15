import express from "express";
import secureRoute from "../middleware/secureRoute";
import { followUser, } from "../controllers/follow.controller";

const router = express.Router();

router.use(secureRoute);

router.post("/:userId", followUser);

export default router;