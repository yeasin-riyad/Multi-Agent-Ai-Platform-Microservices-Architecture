import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  Paperclip,
  Presentation,
  Send,
  Zap,
} from "lucide-react";
import { useState } from "react";
import sendMessage from "../features/sendMessage";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setLoading, setMessages } from "../redux/messageSlice";
import { createConversation } from "../features/createConversation";
import {
  addConversation,
  setConvTitle,
  setSelectedConversations,
} from "../redux/conversationSlice";
import { updateConversation } from "../features/updateConversation";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);
  // console.log(selectedAgent,"Agent...");

  const dispatch = useDispatch();


const handleSendMessage = async () => {
  if (!value.trim()) return;

  try {
    let conversation = selectedConversation;

    if (!conversation) {
      const conv = await createConversation();
      dispatch(setSelectedConversations(conv));
      dispatch(addConversation(conv));
      conversation = conv;
    }

    if (conversation?.title === "New Chat") {
      await updateConversation({
        id: conversation._id,
        title: value.trim(),
      });
      dispatch(
        setConvTitle({
          conversationId: conversation._id,
          title: value.slice(0, 40),
          agent: selectedAgent.toLowerCase(),
        })
      );
    }

    const payload = {
      prompt: value.trim(),
      conversationId: conversation?._id,
      agent: selectedAgent.toLowerCase(),
    };

    dispatch(addMessage({ role: "user", content: value.trim() }));
    setValue("");

    // 👇 Start loading
    dispatch(setLoading(true));

    const data = await sendMessage(payload);

    if (!data) {
      console.warn("sendMessage returned no data");
      dispatch(
        addMessage({
          role: "assistant",
          content:
            "দুঃখিত, সার্ভার থেকে কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।",
        })
      );
      return;
    }

    dispatch(setArtifacts(data?.artifacts || []));
    dispatch(
      addMessage({
        role: "assistant",
        content: data?.answer || "",
        images: data?.images || [],
      })
    );
  } catch (error) {
    console.error("handleSendMessage failed:", error);
    dispatch(
      addMessage({
        role: "assistant",
        content:
          "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।",
      })
    );
  } finally {
    // 👇 Stop loading (success or error — both cases)
    dispatch(setLoading(false));
  }
};

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
      placeholder: "Ask Anything...",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
      placeholder: "Start a conversation... ask me anything",
    },
    {
      id: "coding",
      icon: Code2,
      label: "coding",
      placeholder:
        "Describe your code problem or paste an error to debug...",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
      placeholder: "Describe the PDF you want — topic, sections, tone...",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
      placeholder:
        "Build your presentation — tell what you want...",
    },
    {
      id: "vision",
      icon: ImageIcon,
      label: "Vision",
      placeholder: "Create an image or describe what you want to analyze...",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
      placeholder: "Search the web for latest information...",
    },
  ];

  // 👇 Get the placeholder for the currently selected agent
  const currentAgent = agents.find((a) => a.label === selectedAgent);
  const placeholder = currentAgent?.placeholder || "Ask Anything...";

  return (
    <div
      className="w-full overflow-hidden px:3 md:px-5 py-4 border-t border-white/[0.06] 
    bg-[#0d0f14]"
    >
      <div className="flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">
        <div className="flex  gap-2 pr-2 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.label)}
                className={`
            flex-shrink-0 inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all
            ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
            }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />

                {agent.label}
              </div>
            );
          })}
        </div>

        <textarea
          onChange={(e) => setValue(e.target.value)}
          value={value}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 
        leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        disabled:opacity-50"
          rows={3}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 
                hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
                transition-all duration-150 bg-transparent cursor-pointer"
            >
              <Paperclip size={16} />
            </button>

            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 
                hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
                transition-all duration-150 bg-transparent cursor-pointer"
            >
              <Mic size={16} />
            </button>
          </div>

          <div></div>

          <button
            onClick={handleSendMessage}
            disabled={!value || !value.trim()}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none transition-all duration-150 ${
              value && value.trim()
                ? "bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white cursor-pointer"
                : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;