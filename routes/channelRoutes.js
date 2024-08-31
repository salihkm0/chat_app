import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addMembersToChannel, createChannel, getChannelMessages, getUserChannels, removeMembersFromChannel, updateChannelName } from "../controllers/channelController.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel" , verifyToken,createChannel)
channelRoutes.get("/get-user-channels" , verifyToken,getUserChannels)
channelRoutes.get("/get-channel-messages/:channelId" , verifyToken,getChannelMessages)
channelRoutes.patch("/:channelId/update-name",verifyToken, updateChannelName);
channelRoutes.patch("/:channelId/add-members",verifyToken, addMembersToChannel);
channelRoutes.patch("/:channelId/remove-members",verifyToken, removeMembersFromChannel);

export default channelRoutes