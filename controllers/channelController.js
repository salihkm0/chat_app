import mongoose from "mongoose";
import Channel from "../models/channelModel.js";
import User from "../models/userModel.js";

export const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.user.userId;

    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(404).json({ message: "Admin User not found" });
    }
    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res
        .status(400)
        .json({ message: "Some members are not valid members" });
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });
    await newChannel.save();
    return res
      .status(201)
      .json({ message: "Channel created successfully", channel: newChannel });
  } catch (error) {
    console.log(`Error in creating: ${error.message}`);
    return res.status(500).json({ err: `Error in creating: ${error.message}` });
  }
};

export const getUserChannels = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const channels = await Channel.find({
      $or: [{ members: userId }, { admin: userId }],
    }).sort({ updatedAt: -1 });
    if (channels.length === 0) {
      return res.status(404).json({ message: "No channels found" });
    }
    return res.status(200).json(channels);
  } catch (error) {}
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "_id email name avatar",
      },
    });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    const messages = channel.messages;
    return res.status(200).json(messages);
  } catch (error) {
    console.log(`Error in getting messages: ${error.message}`);
    return res
      .status(500)
      .json({ err: `Error in getting messages: ${error.message}` });
  }
};

// Update Channel Name (Admin Only)
export const updateChannelName = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    // Check if the user is the admin of the channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (channel.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the admin can update the channel name" });
    }

    channel.name = name;
    await channel.save();

    return res.status(200).json({ message: "Channel name updated successfully", channel });
  } catch (error) {
    console.log(`Error in updating channel name: ${error.message}`);
    return res.status(500).json({ err: `Error in updating channel name: ${error.message}` });
  }
};

// Add Members to Channel (Admin Only)
export const addMembersToChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { members } = req.body;
    const userId = req.user.userId;

    // Check if the user is the admin of the channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (channel.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the admin can add members" });
    }

    // Validate members
    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).json({ message: "Some members are not valid users" });
    }

    channel.members.addToSet(...members); // Use addToSet to avoid duplicates
    await channel.save();

    return res.status(200).json({ message: "Members added successfully", channel });
  } catch (error) {
    console.log(`Error in adding members: ${error.message}`);
    return res.status(500).json({ err: `Error in adding members: ${error.message}` });
  }
};

// Remove Members from Channel (Admin Only)
export const removeMembersFromChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { members } = req.body;
    const userId = req.user.userId;

    // Check if the user is the admin of the channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (channel.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the admin can remove members" });
    }

    channel.members = channel.members.filter(
      (memberId) => !members.includes(memberId.toString())
    );

    await channel.save();

    return res.status(200).json({ message: "Members removed successfully", channel });
  } catch (error) {
    console.log(`Error in removing members: ${error.message}`);
    return res.status(500).json({ err: `Error in removing members: ${error.message}` });
  }
};