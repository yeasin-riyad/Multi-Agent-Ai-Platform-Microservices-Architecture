import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import {
  setArtifacts,
  setMessages,
  setLoading,
} from "../redux/messageSlice";

const ChatArea = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading } = useSelector((state) => state.message); // 👈 read loading

  const dispatch = useDispatch();

  useEffect(() => {
    const getMessage = async () => {
      if (!selectedConversation) return;
      if (selectedConversation.title === "New Chat") return;

      try {
        dispatch(setLoading(true)); // 👈 start loading while fetching

        const data = await getMessages(selectedConversation?._id);
        dispatch(setMessages(data));

        const latestArtifactMessage = [...data]
          .reverse()
          .find((msg) => msg.artifacts && msg.artifacts.length > 0);
        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        dispatch(setLoading(false)); // 👈 stop loading
      }
    };

    getMessage();
  }, [selectedConversation?._id, dispatch]);

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <Nav />
      <MessageList isLoading={isLoading} />
      <ChatInput />
    </div>
  );
};

export default ChatArea;