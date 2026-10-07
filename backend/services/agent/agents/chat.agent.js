// import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
// import { getModel } from "../config/llmModels.js"
// import { getMemory } from "../config/memory.js";

// export const chatAgent=async (state) => {
//     // console.log(state,"state")
//     const llm=await getModel("chat");
//     const history=await getMemory(state?.conversationId);

//     const searchContext=state.searchResults? `
//     Web Search Results: ${JSON.stringify(state.searchResults)}
//     Answer the answer using only the above search results.`:""

//     const systemPrompt=`You are agentixAI, an Intelligent AI assistant Made by Yeasin Riyad.

//     ${searchContext}
    
//     if searchContext exists:

//     - Use search results to answer.
//     - Do not mention internal tools

//     Rules:

//     - For simple questions, greetings, and short queries, respond naturally in plain text.
//     - For technical, educational, coding, or detailed topics, use clean Markdown.
    
//     Formatting:

//     - Use # for titles and ## for sections.
//     - Leave a blank line after headings.
//     - Use bullet points for lists.
//     - Use numbered lists for steps.
//     - Use fenced code blocks with language tags for code.
//     - Keep paragraphs short and readable.
//     - Never write headings and content on the same line.
//     - Never generate large walls of text.
//     `
//      const messages=[
//         new SystemMessage(systemPrompt)
//     ];

//     history.forEach(msg=>{
//         if(msg.role=="user"){
//             messages.push(new HumanMessage(msg.content));
//         }
//         if(msg.role=="assistant"){
//             messages.push(new AIMessage(msg.content));
//         }
//     });

//     // messages.push(new HumanMessage(state.prompt));
//     // console.log(messages,"Messages...");
//     const response = (await llm).invoke(messages);

//     return {
//         ...state,
//         aiResponse:(await response).content
//     }
    
// }



import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";

export const chatAgent = async (state) => {
    console.log(state?.messages,'Messss')

    const llm = await getModel("chat");

    // ১. সার্চ রেজাল্ট থাকলে তা কনটেক্সট হিসেবে যুক্ত হবে
    const searchContext = state.searchResults ? `
    Web Search Results: ${JSON.stringify(state.searchResults)}
    Answer the answer using only the above search results.` : "";

    const systemPrompt = `You are agentixAI, an Intelligent AI assistant Made by Yeasin Riyad.

    ${searchContext}
    
    if searchContext exists:
    - Use search results to answer.
    - Do not mention internal tools

    Rules:
    - For simple questions, greetings, and short queries, respond naturally in plain text.
    - For technical, educational, coding, or detailed topics, use clean Markdown.
    
    Formatting:
    - Use # for titles and ## for sections.
    - Leave a blank line after headings.
    - Use bullet points for lists.
    - Use numbered lists for steps.
    - Use fenced code blocks with language tags for code.
    - Keep paragraphs short and readable.
    - Never write headings and content on the same line.
    - Never generate large walls of text.
    `;

    // ২. সিস্টেম প্রম্পট দিয়ে মেসেজ অ্যারে শুরু করা হচ্ছে
    const messages = [
        new SystemMessage(systemPrompt)
    ];

    // ৩. স্টেটে যদি আগের কোনো মেসেজ হিস্টোরি (messages) থাকে, তবে তা পুশ করা হচ্ছে
    // ল্যাংগ্রাফের MessagesAnnotation বা কাস্টম অ্যারে থাকলে এটি চমৎকার কাজ করবে
    if (state.messages && Array.isArray(state.messages)) {
        state.messages.forEach(msg => {
            if (msg.role === "user" || msg instanceof HumanMessage) {
                messages.push(new HumanMessage(msg.content));
            }
            if (msg.role === "assistant" || msg instanceof AIMessage) {
                messages.push(new AIMessage(msg.content));
            }
        });
    }

    // ৪. ক্রিশিয়াল চেঞ্জ: এক্সটার্নাল মেমোরি ফাইলের পরিবর্তে কারেন্ট ইউজার প্রম্পটটি 
    // সরাসরি স্টেট (state.prompt) থেকে নিয়ে মেসেজ লিস্টে যুক্ত করা হচ্ছে
    if (state.prompt) {
        messages.push(new HumanMessage(state.prompt));
    }

    // ৫. মডেল কল করা হচ্ছে
    const response = await (await llm).invoke(messages);

    // ৬. ল্যাংগ্রাফের নিয়ম অনুযায়ী শুধু পরিবর্তিত প্রপার্টি রিটার্ন করা হচ্ছে
    // (পুরো ...state স্প্রেড করার দরকার নেই, ল্যাংগ্রাফ অটো-মার্জ করে নেয়)
    return {
        aiResponse: response.content
    };
};
