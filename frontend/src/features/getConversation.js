import api from "../../utils/axios"

export const getConversation= async()=>{
    try {
        const {data}=await api.get("/api/chat/get-conversation");
        console.log(data)
    } catch (error) {
        console.log(error);
        
    }
}