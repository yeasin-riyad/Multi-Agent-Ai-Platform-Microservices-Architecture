import { getModel } from "../config/llmModels.js"

export const codingAgent=async (state) => {
    const intentLlm= await getModel("intent");
    const intentRes= await intentLlm.invoke(
        `
        You are an intent classifier.
        Return Only One of those values.

        CODE_GENERATION
        CODE_REVIEW
        CODE_EXPLANATION
        DEBUGGING
        OPTIMIZATION
        CONVERSION
        DOCUMENTATION

        User Request:
        ${state.prompt}
        `
    )

    const intent=intentRes.content;
    console.log(intent)
    
}