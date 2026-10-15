// import { getModel } from "../config/llmModels"

// export const imageAnalyzer=(state)=>{
//     try {
//         const llm=await getModel("imageAnalyzer");
//         const imageBuffer= await fs.readFile(state.file.path);
//         const base64Image=imageBuffer.toString("base64");
//     } catch (error) {
        
//     }
// }


import crypto from "node:crypto";
import fs from "fs/promises";
import { getModel } from "../config/llmModels.js";
import { HumanMessage } from "@langchain/core/messages";

export const imageAnalyzer = async (state) => {
  try {
    // 1. Get LLM
    const llm = await getModel("imageAnalyzer");

    // 2. Generate system prompt / analysis strategy
    const systemPromptResponse = await llm.invoke(`
You are an AgentixAI Image Analyzer vision and multimodal analysis expert.

Analyze the user's request and provide instructions on how to thoroughly examine the provided image.

Requirements:
- Detailed visual breakdown
- Accurate context interpretation
- Professional structure
- Clear and concise formatting

Return ONLY the final analysis strategy or optimized instruction prompt.
Do not explain anything.
Do not use markdown.

User Request:
${state.prompt || "Analyze this image and describe what you see in detail."}
`);

    const analysisPrompt = systemPromptResponse.content.toString().trim();

    // 3. Read image file from path stored in state
    const imageBuffer = await fs.readFile(state.file.path);

    if (imageBuffer.length === 0) {
      throw new Error("Image file buffer is empty");
    }

    // 4. Convert image buffer to base64
    const base64Image = imageBuffer.toString("base64");
    const mimeType = state.file.mimetype || "image/jpeg";

    // 5. Build proper LangChain HumanMessage for multimodal input
    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: analysisPrompt,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    });

    // 6. Invoke the model to analyze the image
    const response = await llm.invoke([message]);
    const analysisResult = response.content.toString().trim();

    // 7. Return success response
    return {
      ...state,
      aiResponse: `
## 🔍 Image Analysis Results

${analysisResult}

      `.trim(),
    };

  } catch (error) {
    console.error("Image Analysis Agent Error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while analyzing the image.";

    return {
      ...state,
      aiResponse: `
## ❌ Image Analysis Failed

😔 Sorry, I couldn't analyze your image.

⚠️ **Error:**
${errorMessage}

🔄 **Please try again** with a valid image file.
      `.trim(),
    };
  }
};