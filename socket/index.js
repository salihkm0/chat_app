import { Server as SocketIoServer } from "socket.io";
import Message from "../models/messageModel.js";
import Channel from "../models/channelModel.js";

const setupSocket = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    // console.log(`User Disconnected : ${userId}`);
    const userId = socket.handshake.query.userId;
    console.log(`User Disconnected : ${userId} with socket id : ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    console.log("hiited send msg");
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    console.log(
      "senderSocketId : ",
      senderSocketId,
      "recipientSocketId : ",
      recipientSocketId
    );

    const createdMessage = await Message.create(message);
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email name avatar")
      .populate("recipient", "id email name avatar");
    console.log("mssage : ", messageData);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("recieveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    const channel = await Channel.findById(channelId).populate("members");

    console.log("channel : " , channel)

    if (!channel) {
      console.log(`Channel ${channelId} not found or you are not a member in this channel.`);
      const senderSocketId = userSocketMap.get(sender);
      if (senderSocketId) {
        io.to(senderSocketId).emit("errorMessage", {
          message: "Channel not found or you are not a member in this channel`.",
        });
      }
      return;
    }
    const isMember = channel.members.some((member) => member._id.toString() === sender);
    const isAdmin = channel.admin && channel.admin._id.toString() === sender;
  
    if (!isMember && !isAdmin) {
      console.log(`User ${sender} is neither a member nor an admin of channel ${channelId}`);
      const senderSocketId = userSocketMap.get(sender);
  
      if (senderSocketId) {
        io.to(senderSocketId).emit("errorMessage", {
          message: "You are not authorized to send messages in this channel.",
        });
      }
      return;
    }

    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      fileUrl,
      timestamp: Date.now(),
    });
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email name avatar")
      .exec();

    await Channel.findByIdAndUpdate(channelId, {
      $push: {
        messages: createdMessage._id,
      },
    });

    // const channel = await Channel.findById(channelId).populate("members");
    const finalData = { ...messageData._doc, channelId: channel._id };

    console.log("finalData : ", finalData);

    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieveChannelMessage", finalData);
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("recieveChannelMessage", finalData);
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User Connected : ${userId} with socket id : ${socket.id}`);
    } else {
      console.log("user id not provided during connection");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("sendChannelMessage", sendChannelMessage);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
