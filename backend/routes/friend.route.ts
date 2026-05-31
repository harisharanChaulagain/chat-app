import express from "express";

import secureRoute from "../middleware/secureRoute";
import { getFriendProfile } from "../controllers/friend.controller";


const router = express.Router();

router.use(secureRoute);

router.get("/friendsProfile", secureRoute, getFriendProfile);

export default router;
