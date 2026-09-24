import { getModel } from "../config/llmModels.js"

export const router=async (params) => {
    const llm = await getModel("router");

    
}