
import { StateGraph, END } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { chargeCreditsNode } from "./chargeCredits.js";

import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { codingAgent } from "../agents/coding.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { visionAgent } from "../agents/vision.agent.js";
import { pdfRag } from "../agents/pdfRag.agent.js";
import { imageAnalyzer } from "../agents/imageAnalyzer.agent.js";

const workflow = new StateGraph(agentState);

/* Nodes */
workflow.addNode("router", router);
workflow.addNode("chargeCredits", chargeCreditsNode);
workflow.addNode("chat", chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("pdf", pdfAgent);
workflow.addNode("ppt", pptAgent);
workflow.addNode("vision", visionAgent);
workflow.addNode("pdfRag", pdfRag);
workflow.addNode("imageAnalyzer", imageAnalyzer);

/* Entry → router */
workflow.addEdge("__start__", "router");

/* Router → END on error, otherwise charge credits */
workflow.addConditionalEdges(
  "router",
  (state) => {
    if (state.error) return "end";
    return "chargeCredits";
  },
  {
    end: END,
    chargeCredits: "chargeCredits",
  }
);

/* Charge credits → selected agent or END */
workflow.addConditionalEdges(
  "chargeCredits",
  (state) => {
    if (state.error) return "end";

    switch (state.agent) {
      case "chat": return "chat";
      case "search": return "search";
      case "coding": return "coding";
      case "pdf": return "pdf";
      case "ppt": return "ppt";
      case "vision": return "vision";
      case "pdfRag": return "pdfRag";
      case "imageAnalyzer": return "imageAnalyzer";
      default: return "end";
    }
  },
  {
    chat: "chat",
    search: "search",
    coding: "coding",
    pdf: "pdf",
    ppt: "ppt",
    vision: "vision",
    pdfRag: "pdfRag",
    imageAnalyzer: "imageAnalyzer",
    end: END,
  }
);

/* Agent → next */
workflow.addEdge("search", "chat");
workflow.addEdge("chat", END);
workflow.addEdge("coding", END);
workflow.addEdge("pdf", END);
workflow.addEdge("ppt", END);
workflow.addEdge("vision", END);
workflow.addEdge("pdfRag", END);
workflow.addEdge("imageAnalyzer", END);

export const graph = workflow.compile();
