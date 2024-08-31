import Message from "../models/messageModel.js";

export const getMessages = async (req, res) => {
  try {
    // console.log("user : ", req.user.userId)
    const user1 = req.user.userId;
    const user2 = req.body.id;

    if (!user1 || !user2) {
      return res.status(400).json({ message: "Both user Id's are required." });
    }
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });
    return res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    return res.status(500).send("internal server error");
  }
};

// export const createMessage = async (req, res) => {
//   try {
//     const { recipient, messageType,content } = req.body;
//     const sender = req.user.userId;
//     const newMessage = new Message({
//       sender,
//       recipient,
//       messageType,
//       content,
//     });
//     await newMessage.save();
//     return res.status(201).json({ message: "Message created successfully" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("internal server error");
//   }
// };
