import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";

const MessageList = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages, isLoading } = useSelector((state) => state.message);

  const bottomRef = useRef(null);

  // 👇 Auto-scroll when new message arrives or loading starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 || !selectedConversation ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[20px] font-semibold text-slate-200 tracking-tight">
              AgentixAI
            </h1>
            <p className="text-[15px] font-semibold text-slate-400 tracking-tight">
              How Can I help you?
            </p>
            <p className="text-[13px] text-slate-600 max-w-[260px] leading-relaxed">
              Ask me anything -- code, ideas, explanations, or just a quick
              question.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {["Write a Netflix clone", "Explain Redis", "Build a Dashboard"].map(
              (text) => (
                <button
                  key={text}
                  className="text-[12px] text-slate-400 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-lg 
                hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-150 cursor-pointer"
                >
                  {text}
                </button>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {messages?.map((msg) => (
            <div key={msg._id || msg.id}>
              <MessageBubble
                role={msg?.role}
                content={msg?.content}
                images={msg?.images || []}
              />
            </div>
          ))}

          {/* 👇 Loading indicator — appears as an assistant bubble */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl 
                bg-white/[0.03] border border-white/[0.07]"
              >
                {/* Animated dots */}
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                </div>

                <span className="text-[13px] text-slate-500">
                  Agentix is thinking...
                </span>
              </div>
            </div>
          )}

          {/* 👇 Auto-scroll anchor */}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;