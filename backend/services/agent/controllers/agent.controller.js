import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
export const agent = async (req, res) => {
  try {
    const { prompt, conversationId,agent } = req.body;

    await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });
    await addMessage(conversationId, "user", prompt);

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
    });

    const response = result.aiResponse;
    const images=result?.images;
    const artifacts=result?.artifacts;
     await addMessage(conversationId, "assistant", response);


    await axios.post(`${process.env.CHAT_SERVICE_URL}/save-message`, {
      conversationId,
      role: "assistant",
      content: response,
      images,
      artifacts
    });

    return res.status(200).json({
      answer:response,
      images,
      artifacts
    });
  } catch (error) {
    return res.status(500).json({ message: `agent error ${error}` });
  }
};
