import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversation = await Conversation.create({
      userId,
    });

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({
      message: `create conversation error ${error}`,
    });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;

    const updateConversation = await Conversation.findByIdAndUpdate(
      id,
      { title },
      { new: true },
    );

    if (!updateConversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    res.status(200).json(updateConversation);
  } catch (error) {
    res.status(500).json({
      message: `update conversation error ${error}`,
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const conversations = await Conversation.find({
      userId,
    }).sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({
      message: `get conversation error ${error}`,
    });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const {
      conversationId,
      role,
      content,
      images,
      artifacts,
    } = req.body;

    const message = await Message.create({
      conversationId,
      content,
      role,
      images,
      artifacts,
    });

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({
      message: `save message error ${error}`,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: `get messages error ${error}`,
    });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { id } = req.params;

    console.log(id,"Id...")

    const conversation = await Conversation.findOne({
      _id: id,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    await Message.deleteMany({
      conversationId: id,
    });

    await Conversation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      conversationId: id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `delete conversation error ${error}`,
    });
  }
};