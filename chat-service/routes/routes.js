import express from 'express';
import chatController from "../controller/chatController.js";

let router = express.Router();
router.post("/getAllMessages", chatController.getAllMessages);
router.post("/createNewMessage", chatController.createNewMessage);

export default router;
