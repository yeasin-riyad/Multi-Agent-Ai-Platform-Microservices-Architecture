
import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

const STATUS_MAP = {
  INSUFFICIENT_CREDITS: 402,
  PLAN_EXPIRED: 403,
  USER_NOT_FOUND: 404,
  RATE_LIMIT_EXCEEDED: 429,
  INVALID_AGENT: 400,
  SERVICE_UNAVAILABLE: 503,
  RATE_LIMIT_SERVICE_UNAVAILABLE: 503,
};

const saveConversationMessage = async ({
  conversationId,
  role,
  content,
  images = [],
  artifacts = [],
}) => {
  // Save to chat service (MongoDB)
  try {
    await axios.post(
      `${process.env.CHAT_SERVICE_URL}/api/chat/save-message`,
      {
        conversationId,
        role,
        content,
        ...(role === "assistant" ? { images, artifacts } : {}),
      },
    );
  } catch (error) {
    console.error(
      `MongoDB message save failed (${role}):`,
      error.response?.data || error.message,
    );
  }

  // Save to application memory (Redis, if configured that way)
  try {
    await addMessage(conversationId, role, content);
  } catch (error) {
    console.error(
      `Conversation memory save failed (${role}):`,
      error.message,
    );
  }
};

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent: agentType } = req.body;
    const file = req.file;
    const userId = req.headers["x-user-id"];

    /* ─── Validate request ────────────────────────────── */

    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "User ID missing",
      });
    }

    if (!prompt?.trim() && !file) {
      return res.status(400).json({
        success: false,
        code: "INVALID_INPUT",
        message: "prompt or file required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        code: "INVALID_CONVERSATION",
        message: "conversationId required",
      });
    }

    /* ─── Save user message ───────────────────────────── */

    await saveConversationMessage({
      conversationId,
      role: "user",
      content: prompt || "",
    });

    /* ─── Execute LangGraph ───────────────────────────── */

    const result = await graph.invoke({
      prompt: prompt || "",
      conversationId,
      agent: agentType,
      userId,
      file,
    });

    console.log("[agent] Graph result:", {
      agent: result.agent,
      error: result.error,
      hasResponse: Boolean(result.aiResponse),
    });

    const images = result.images || [];
    const artifacts = result.artifacts || [];

    /* ─── Handle graph errors ─────────────────────────── */

    if (result.error) {
      const errorCode = result.error.code || "AGENT_ERROR";

      const errorMessage =
        result.error.message ||
        "Something went wrong. Please try again.";

      const status = STATUS_MAP[errorCode] || 500;

      console.warn(
        `[agent] Graph error [${errorCode}]:`,
        errorMessage,
      );

      // Save the actual error message, not a potentially stale
      // or unrelated AI response from the graph state.
      await saveConversationMessage({
        conversationId,
        role: "assistant",
        content: errorMessage,
      });

      return res.status(status).json({
        success: false,
        code: errorCode,
        message: errorMessage,
        answer: errorMessage,
        aiResponse:result.aiResponse || errorMessage,
        ...(result.error.details
          ? { details: result.error.details }
          : {}),
        creditCharged: result.creditCharged ?? 0,
        creditRemaining: result.creditRemaining,
      });
    }

    /* ─── Save successful assistant response ──────────── */

    const response = result.aiResponse || "";

    await saveConversationMessage({
      conversationId,
      role: "assistant",
      content: response,
      images,
      artifacts,
    });

    /* ─── Return success response ─────────────────────── */

    return res.status(200).json({
      success: true,
      answer: response,
      aiResponse: response,
      images,
      artifacts,
      creditCharged: result.creditCharged ?? 0,
      creditRemaining: result.creditRemaining,
    });
  } catch (error) {
    console.error("💥 [agent] CRASHED:", {
      message: error.message,
      stack: error.stack,
    });

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Agent failed. Please try again.";

    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: errorMessage,
      answer: errorMessage,
      aiResponse: errorMessage,
    });
  }
};
