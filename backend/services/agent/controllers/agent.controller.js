// controllers/agent.controller.js
import axios from "axios";
import { graph } from "../graph/graph.js";

export const agent = async (req, res) => {
  let filePath = null;

  try {
    const { prompt, conversationId, agent: agentType } = req.body;
    const file = req.file;
    const userId = req.headers["x-user-id"];

    filePath = file?.path || null;

    // console.log("🎯 [agent] incoming:", {
    //   userId,
    //   agent: agentType,
    //   hasFile: !!file,
    //   fileType: file?.mimetype,
    //   fileSize: file?.size,
    //   promptLength: prompt?.length,
    // });

    /* ─── Validate ────────────────────────────────────────── */
    if (!userId) {
      return res.status(401).json({ message: "User ID missing" });
    }

    if (!prompt?.trim() && !file) {
      return res.status(400).json({ message: "prompt or file required" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    /* ─── Save user message ───────────────────────────────── */
    await axios
      .post(`${process.env.CHAT_SERVICE_URL}/api/chat/save-message`, {
        conversationId,
        role: "user",
        content: prompt || "",
      })
      .catch((err) =>
        console.error("saveMessage (user) failed:", err?.message),
      );

    /* ─── Invoke graph ────────────────────────────────────── */
    const result = await graph.invoke({
      prompt: prompt || "",
      conversationId,
      agent: agentType,
      userId,
      file,
    });

    const response = result.aiResponse;
    const images = result?.images || [];
    const artifacts = result?.artifacts || [];

    /* ─── Handle credit / graph error ─────────────────────── */
    if (result.error) {
      const statusMap = {
        INSUFFICIENT_CREDITS: 402,
        PLAN_EXPIRED: 403,
        USER_NOT_FOUND: 404,
        SERVICE_UNAVAILABLE: 503,
        INVALID_AGENT: 400,
      };
      const status = statusMap[result.error.code] || 500;

      console.warn(
        `🚫 [agent] Graph error [${result.error.code}]:`,
        result.error.message,
      );

      return res.status(status).json({
        code: result.error.code,
        message: result.error.message,
        ...result.error.details,
        creditRemaining: result.creditRemaining,
      });
    }

    /* ─── Save assistant message ──────────────────────────── */
    await axios
      .post(`${process.env.CHAT_SERVICE_URL}/api/chat/save-message`, {
        conversationId,
        role: "assistant",
        content: response,
        images,
        artifacts,
      })
      .catch((err) =>
        console.error("saveMessage (assistant) failed:", err?.message),
      );

    /* ─── Success response ────────────────────────────────── */
    return res.status(200).json({
      answer: response,
      images,
      artifacts,
      creditCharged: result.creditCharged,
      creditRemaining: result.creditRemaining,
    });
  } catch (error) {
    console.error("💥 [agent] CRASHED:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: error.message || "Agent failed",
    });
  }
};