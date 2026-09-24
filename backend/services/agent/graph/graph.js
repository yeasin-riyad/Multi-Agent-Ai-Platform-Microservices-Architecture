import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { router } from "./router.js";
import { chatAgent } from "../agents/chat.agent";
import { searchAgent } from "../agents/search.agent";
import { codingAgent } from "../agents/coding.agent";
import { pdfAgent } from "../agents/pdf.agent";
import { pptAgent } from "../agents/ppt.agent";
import { imageGenAgent } from "../agents/image.agent";

const workflow=new StateGraph(agentState);

workflow.addNode("router",router);
workflow.addNode("chat",chatAgent);
workflow.addNode("search",searchAgent);
workflow.addNode("coding",codingAgent);
workflow.addNode("pdf",pdfAgent);
workflow.addNode("ppt",pptAgent);
workflow.addNode("imageGen",imageGenAgent);