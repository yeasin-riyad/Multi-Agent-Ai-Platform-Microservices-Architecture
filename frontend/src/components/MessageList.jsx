import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";

const SUGGESTIONS = [
  "Write a Netflix clone",
  "Explain Redis",
  "Build a Dashboard",
];

const MessageList = () => {
  const { selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { messages, isLoading } = useSelector(
    (state) => state.message,
  );

  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);

  /* ─────────────────────────────────────────────────────────── */
  /*  Auto-scroll to bottom on new message / loading            */
  /*  Skip smooth scroll for loading (janky on mobile)          */
  /* ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only auto-scroll if user is near bottom
    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const isNearBottom = distanceFromBottom < 150;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({
        behavior: isLoading ? "auto" : "smooth",
        block: "end",
      });
    }
  }, [messages, isLoading]);

  /* ─────────────────────────────────────────────────────────── */
  /*  Empty state                                              */
  /* ─────────────────────────────────────────────────────────── */

  if (messages.length === 0 || !selectedConversation) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 text-center overflow-y-auto">
        <div className="flex flex-col gap-1.5 sm:gap-2 max-w-md">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-200 tracking-tight">
            AgentixAI
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-400 tracking-tight">
            How can I help you?
          </p>
          <p className="text-xs sm:text-[13px] text-slate-600 max-w-[280px] sm:max-w-[320px] leading-relaxed mx-auto">
            Ask me anything — code, ideas, explanations, or just a
            quick question.
          </p>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {SUGGESTIONS.map((text) => (
            <button
              key={text}
              type="button"
              className="
                text-[11px] sm:text-[12px]
                text-slate-400
                bg-white/[0.04]
                border border-white/[0.07]
                px-2.5 sm:px-3
                py-1.5
                rounded-lg
                hover:bg-white/[0.08]
                hover:text-slate-200
                hover:border-white/[0.12]
                transition-colors duration-150
                cursor-pointer
                whitespace-nowrap
              "
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────── */
  /*  Messages                                                 */
  /* ─────────────────────────────────────────────────────────── */

  return (
    <div
      ref={scrollContainerRef}
      className="
        h-full
        w-full
        overflow-y-auto
        overflow-x-hidden
        px-3 sm:px-4 md:px-6
        py-4 sm:py-6
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
        scroll-smooth
      "
    >
      <div className="max-w-3xl mx-auto w-full space-y-4 sm:space-y-5">
        {messages.map((msg) => (
          <div key={msg._id || msg.id}>
            <MessageBubble
              role={msg?.role}
              content={msg?.content}
              images={msg?.images || []}
            />
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start px-1 sm:px-0">
            <div
              className="
                flex items-center gap-2.5 sm:gap-3
                px-3 sm:px-4
                py-2.5 sm:py-3
                rounded-2xl
                bg-white/[0.03]
                border border-white/[0.07]
                max-w-[85%] sm:max-w-[80%]
              "
            >
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
              </div>

              <span className="text-[12px] sm:text-[13px] text-slate-500">
                Agentix is thinking...
              </span>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
};

export default MessageList;