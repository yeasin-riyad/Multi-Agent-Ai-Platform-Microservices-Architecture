
import api from "../../utils/axios";

const sendMessage = async (payload) => {
  try {
    const { data } = await api.post("/api/agent/chat", payload);
    return data;
  } catch (error) {
    console.error("sendMessage failed:", error.response?.data || error.message);

    // Preserve the original backend error for handleSendMessage.
    throw error;
  }
};

export default sendMessage;
