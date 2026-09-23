import Conversation from "../models/conversation.model";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    console.log("userId", userId);
    const conversation = await Conversation.create({
      userId,
    });

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: `create conversation error ${error}` });
  }
};
