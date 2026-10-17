import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import getMessages from "../features/getMessages";
import {
  setArtifacts,
  setMessages,
  setLoading,
} from "../redux/messageSlice";

const ChatArea = () => {
  const { selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { isLoading } = useSelector((state) => state.message);

  const dispatch = useDispatch();

  /* ─────────────────────────────────────────────────────────── */
  /*  Load messages when conversation changes                   */
  /* ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      if (!selectedConversation) {
        // No conversation selected → clear chat
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
        return;
      }

      if (selectedConversation.title === "New Chat") {
        // New chat → empty state
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
        return;
      }

      try {
        dispatch(setLoading(true));

        const data = await getMessages(selectedConversation._id);

        if (cancelled) return;

        dispatch(setMessages(data));

        const latestArtifactMessage = [...(data || [])]
          .reverse()
          .find(
            (msg) =>
              msg.artifacts && msg.artifacts.length > 0,
          );

        dispatch(setArtifacts(latestArtifactMessage?.artifacts || []));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load messages:", error);
        }
      } finally {
        if (!cancelled) dispatch(setLoading(false));
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversation?._id, dispatch]);

  /* ─────────────────────────────────────────────────────────── */
  /*  Layout                                                    */
  /* ─────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-1 flex-col min-w-0 min-h-0 h-full w-full overflow-hidden">
      {/* Nav */}
      <div className="shrink-0 w-full">
        <Nav />
      </div>

      {/* Messages scrollable area */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden relative">
        <MessageList isLoading={isLoading} />
      </div>

      {/* Chat Input */}
      <div className="shrink-0 w-full">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatArea;