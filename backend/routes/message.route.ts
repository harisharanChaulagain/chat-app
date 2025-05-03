import express from "express";
import { getMessage, sendMessage } from "../controllers/message.controller";
import secureRoute from "../middleware/secureRoute";

const router = express.Router();

router.post("/send/:id", secureRoute, sendMessage);
router.get("/get/:id", secureRoute, getMessage);


export default router;
