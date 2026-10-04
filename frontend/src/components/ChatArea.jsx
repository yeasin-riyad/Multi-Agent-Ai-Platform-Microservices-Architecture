import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setArtifacts, setMessages } from "../redux/messageSlice";

const ChatArea = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);

  const dispatch=useDispatch()

  useEffect(() => {
    const getMessage = async () => {
      if (selectedConversation) {
        if(selectedConversation.title=="New Chat") return;
       const data= await getMessages(selectedConversation?._id);
       dispatch(setMessages(data));
       const latestArtifactMessage=[...data].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0)
       dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
      }


    };
    getMessage();
  }, [selectedConversation?._id]);
  return (
    <div className="flex flex-1 flex-col min-w-0">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatArea;
