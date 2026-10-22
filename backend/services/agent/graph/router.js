// graph/router.js
import { checkAgentLimit } from "../config/agentLimit.js";
import { getModel } from "../config/llmModels.js";

export const router = async (state) => {
  let resolvedAgent;

  // 1. File detection
  const hasFile = !!state.file;

  if (hasFile) {
    const mimeType = state.file?.mimetype || "";

    if (mimeType === "application/pdf") {
      resolvedAgent = "pdfRag";
    } else if (mimeType.startsWith("image/")) {
      resolvedAgent = "imageAnalyzer";
    }
  }

  // 2. Explicitly selected agent
  if (!resolvedAgent && state.agent && state.agent !== "auto") {
    resolvedAgent = state.agent;
  }

  // 3. Auto mode — LLM decides
  if (!resolvedAgent) {
    const llm = await getModel("router");

    const prompt = `
You are an agent router.

Available agents:
- chat
- search
- coding
- pdf
- ppt
- vision
- pdfRag
- imageAnalyzer

Rules:
chat: General conversation, explanations, learning, questions.
search: Current events, latest information, news, internet lookup.
coding: Generate code, debug code, build projects, API design.
pdf: Generate PDFs from a prompt.
ppt: Generate PPTs from a prompt.
vision: Generate or edit images.
pdfRag: Analyze an uploaded PDF.
imageAnalyzer: Analyze an uploaded image.

Return only one agent name.

User Query:
${state.prompt}
`;

    const response = await llm.invoke(prompt);
    const raw = response.content.toString().trim().toLowerCase();

    const agentMap = {
      chat: "chat",
      search: "search",
      coding: "coding",
      pdf: "pdf",
      ppt: "ppt",
      vision: "vision",
      pdfrag: "pdfRag",
      imageanalyzer: "imageAnalyzer",
    };

    resolvedAgent =
      agentMap[raw] ||
      Object.entries(agentMap).find(([key]) =>
        new RegExp(`\\b${key}\\b`, "i").test(raw)
      )?.[1] ||
      "chat";
  }

  console.log(`🔀 [router] Resolved agent: ${resolvedAgent}`);

  // 4. Rate limit check
  if (state.userId) {
    try {
      const rateLimit = await checkAgentLimit(
        state.userId,
        resolvedAgent
      );

      if (!rateLimit.allowed) {
        console.warn(
          `🚫 [router] Rate limit exceeded for ${resolvedAgent}`
        );

        return {
          ...state,
          agent: resolvedAgent,
          aiResponse:
            `## ⏳ Rate Limit Exceeded\n\n` +
            `You've reached the request limit for **${resolvedAgent}**.\n\n` +
            `Please try again in **${rateLimit.retryAfter} seconds**.`,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: rateLimit.message,
            details: {
              limit: rateLimit.limit,
              remaining: rateLimit.remaining,
              retryAfter: rateLimit.retryAfter,
            },
          },
        };
      }
    } catch (error) {
      console.error("[router] Rate limit check failed:", error);

      // Fail closed: do not execute the agent if Redis is unavailable.
      return {
        ...state,
        agent: resolvedAgent,
        aiResponse:
          "## ⚠️ Service Temporarily Unavailable\n\nPlease try again shortly.",
        error: {
          code: "RATE_LIMIT_SERVICE_UNAVAILABLE",
          message: "Could not verify request limit.",
        },
      };
    }
  }

  // 5. Continue to the selected agent
  return {
    ...state,
    agent: resolvedAgent,
  };
};