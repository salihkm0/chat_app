import { Router } from "express";
import {getMessages } from "../controllers/messagesController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const messageRoutes = Router();

messageRoutes.post('/get-messages', verifyToken , getMessages)
// messageRoutes.post('/send-messages', verifyToken , createMessage)


export default messageRoutes