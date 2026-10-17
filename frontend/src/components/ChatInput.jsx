// import {
//   Code2,
//   FileText,
//   Globe,
//   ImageIcon,
//   MessageSquare,
//   Mic,
//   Paperclip,
//   Presentation,
//   Send,
//   Zap,
// } from "lucide-react";
// import { useState } from "react";
// import sendMessage from "../features/sendMessage";
// import { useDispatch, useSelector } from "react-redux";
// import { addMessage, setArtifacts, setLoading, setMessages } from "../redux/messageSlice";
// import { createConversation } from "../features/createConversation";
// import {
//   addConversation,
//   setConvTitle,
//   setSelectedConversations,
// } from "../redux/conversationSlice";
// import { updateConversation } from "../features/updateConversation";

// const ChatInput = () => {
//   const [value, setValue] = useState("");
//   const [selectedAgent, setSelectedAgent] = useState("Auto");
//   const { selectedConversation } = useSelector((state) => state.conversation);
//   const { messages } = useSelector((state) => state.message);
//   // console.log(selectedAgent,"Agent...");

//   const dispatch = useDispatch();


// const handleSendMessage = async () => {
//   if (!value.trim()) return;

//   try {
//     let conversation = selectedConversation;

//     if (!conversation) {
//       const conv = await createConversation();
//       dispatch(setSelectedConversations(conv));
//       dispatch(addConversation(conv));
//       conversation = conv;
//     }

//     if (conversation?.title === "New Chat") {
//       await updateConversation({
//         id: conversation._id,
//         title: value.trim(),
//       });
//       dispatch(
//         setConvTitle({
//           conversationId: conversation._id,
//           title: value.slice(0, 40),
//           agent: selectedAgent.toLowerCase(),
//         })
//       );
//     }

//     const payload = {
//       prompt: value.trim(),
//       conversationId: conversation?._id,
//       agent: selectedAgent.toLowerCase(),
//     };

//     dispatch(addMessage({ role: "user", content: value.trim() }));
//     setValue("");

//     // 👇 Start loading
//     dispatch(setLoading(true));

//     const data = await sendMessage(payload);

//     if (!data) {
//       console.warn("sendMessage returned no data");
//       dispatch(
//         addMessage({
//           role: "assistant",
//           content:
//             "দুঃখিত, সার্ভার থেকে কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।",
//         })
//       );
//       return;
//     }

//     dispatch(setArtifacts(data?.artifacts || []));
//     dispatch(
//       addMessage({
//         role: "assistant",
//         content: data?.answer || "",
//         images: data?.images || [],
//       })
//     );
//   } catch (error) {
//     console.error("handleSendMessage failed:", error);
//     dispatch(
//       addMessage({
//         role: "assistant",
//         content:
//           "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।",
//       })
//     );
//   } finally {
//     // 👇 Stop loading (success or error — both cases)
//     dispatch(setLoading(false));
//   }
// };

//   const agents = [
//     {
//       id: "auto",
//       icon: Zap,
//       label: "Auto",
//       placeholder: "Ask Anything...",
//     },
//     {
//       id: "chat",
//       icon: MessageSquare,
//       label: "Chat",
//       placeholder: "Start a conversation... ask me anything",
//     },
//     {
//       id: "coding",
//       icon: Code2,
//       label: "coding",
//       placeholder:
//         "Describe your code problem or paste an error to debug...",
//     },
//     {
//       id: "pdf",
//       icon: FileText,
//       label: "PDF",
//       placeholder: "Describe the PDF you want — topic, sections, tone...",
//     },
//     {
//       id: "ppt",
//       icon: Presentation,
//       label: "PPT",
//       placeholder:
//         "Build your presentation — tell what you want...",
//     },
//     {
//       id: "vision",
//       icon: ImageIcon,
//       label: "Vision",
//       placeholder: "Create an image or describe what you want to analyze...",
//     },
//     {
//       id: "search",
//       icon: Globe,
//       label: "Search",
//       placeholder: "Search the web for latest information...",
//     },
//   ];

//   // 👇 Get the placeholder for the currently selected agent
//   const currentAgent = agents.find((a) => a.label === selectedAgent);
//   const placeholder = currentAgent?.placeholder || "Ask Anything...";

//   return (
//     <div
//       className="w-full overflow-hidden px:3 md:px-5 py-4 border-t border-white/[0.06] 
//     bg-[#0d0f14]"
//     >
//       <div className="flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">
//         <div className="flex  gap-2 pr-2 flex-wrap">
//           {agents.map((agent) => {
//             const isActive = selectedAgent === agent.label;
//             const Icon = agent.icon;
//             return (
//               <div
//                 key={agent.id}
//                 onClick={() => setSelectedAgent(agent.label)}
//                 className={`
//             flex-shrink-0 inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all
//             ${
//               isActive
//                 ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
//                 : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
//             }`}
//               >
//                 <Icon
//                   size={14}
//                   className={isActive ? "text-white" : "text-slate-500"}
//                 />

//                 {agent.label}
//               </div>
//             );
//           })}
//         </div>

//         <textarea
//           onChange={(e) => setValue(e.target.value)}
//           value={value}
//           placeholder={placeholder}
//           className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 
//         leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
//         disabled:opacity-50"
//           rows={3}
//         />

//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-1">
//             <button
//               className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 
//                 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
//                 transition-all duration-150 bg-transparent cursor-pointer"
//             >
//               <Paperclip size={16} />
//             </button>

//             <button
//               className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 
//                 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
//                 transition-all duration-150 bg-transparent cursor-pointer"
//             >
//               <Mic size={16} />
//             </button>
//           </div>

//           <div></div>

//           <button
//             onClick={handleSendMessage}
//             disabled={!value || !value.trim()}
//             className={`flex items-center justify-center w-8 h-8 rounded-lg border-none transition-all duration-150 ${
//               value && value.trim()
//                 ? "bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white cursor-pointer"
//                 : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
//             }`}
//           >
//             <Send size={15} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInput;


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
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import sendMessage from "../features/sendMessage";
import { addMessage, setArtifacts, setLoading } from "../redux/messageSlice";
import { createConversation } from "../features/createConversation";
import {
  addConversation,
  setConvTitle,
  setSelectedConversations,
} from "../redux/conversationSlice";
import { updateConversation } from "../features/updateConversation";

/* ──────────────────────────────────────────────────────────────── */
/*  Constants                                                     */
/* ──────────────────────────────────────────────────────────────── */

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const AGENTS = [
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
    label: "Coding",
    placeholder: "Describe your code problem or paste an error to debug...",
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
    placeholder: "Build your presentation — tell what you want...",
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

/* ──────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ──────────────────────────────────────────────────────────────── */

const ChatInput = () => {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ─────────────────────────────────────────────────────────── */
  /*  File selection                                            */
  /* ─────────────────────────────────────────────────────────── */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 20MB limit");
      e.target.value = null;
      return;
    }

    // MIME check
    if (!ALLOWED_MIMES.has(file.mimetype || file.type)) {
      toast.error("Only PDF and images (jpg, png, webp, gif) are allowed");
      e.target.value = null;
      return;
    }

    setSelectedFile(file);
    toast.success(`Attached: ${file.name}`);

    // Auto-switch agent based on file type
    if (file.type === "application/pdf") {
      if (selectedAgent === "auto" || selectedAgent === "chat") {
        setSelectedAgent("pdf");
      }
    } else if (file.type.startsWith("image/")) {
      if (selectedAgent === "auto" || selectedAgent === "chat") {
        setSelectedAgent("vision");
      }
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  Send message                                              */
  /* ─────────────────────────────────────────────────────────── */

  const handleSendMessage = async () => {
    if ((!value.trim() && !selectedFile) || isSending) return;

    const currentFile = selectedFile;
    const currentValue = value.trim();

    setIsSending(true);

    try {
      /* ─── Ensure conversation exists ─────────────────────────── */
      let conversation = selectedConversation;

      if (!conversation) {
        const conv = await createConversation();
        if (!conv) {
          toast.error("Could not start conversation");
          return;
        }
        dispatch(setSelectedConversations(conv));
        dispatch(addConversation(conv));
        conversation = conv;
      }

      /* ─── Update conversation title if new ────────────────────── */
      if (conversation?.title === "New Chat") {
        const titleText =
          currentValue || currentFile?.name || "File Upload";

        await updateConversation({
          id: conversation._id,
          title: titleText,
        });

        dispatch(
          setConvTitle({
            conversationId: conversation._id,
            title: titleText.slice(0, 40),
          }),
        );
      }

      /* ─── Optimistically add user message ─────────────────────── */
      dispatch(
        addMessage({
          role: "user",
          content:
            currentValue ||
            `Uploaded file: ${currentFile?.name || "attachment"}`,
          images: currentFile?.type?.startsWith("image/")
            ? [URL.createObjectURL(currentFile)]
            : [],
        }),
      );

      /* ─── Clear input immediately ─────────────────────────────── */
      setValue("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      dispatch(setLoading(true));

      /* ─── Build FormData ──────────────────────────────────────── */
      const formData = new FormData();
      formData.append("prompt", currentValue);
      formData.append("conversationId", conversation._id);
      formData.append("agent", selectedAgent); // "auto" | "chat" | "pdf" | ...

      if (currentFile) {
        formData.append("file", currentFile);
      }

      /* ─── Send ────────────────────────────────────────────────── */
      const data = await sendMessage(formData);

      /* ─── Handle response ─────────────────────────────────────── */
      if (!data) {
        console.warn("sendMessage returned no data");
        dispatch(
          addMessage({
            role: "assistant",
            content:
              "দুঃখিত, সার্ভার থেকে কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।",
          }),
        );
        return;
      }

      /* ─── Handle credit / error ──────────────────────────────── */
      if (data.error || data.code) {
        const code = data.code;

        if (code === "INSUFFICIENT_CREDITS") {
          toast.error(
            `You need ${data.required || "more"} credits. You have ${data.available || 0}.`,
          );
          navigate("/billing");
          return;
        }

        if (code === "PLAN_EXPIRED") {
          toast.error("Your plan has expired. Please renew.");
          navigate("/billing");
          return;
        }

        if (code === "SERVICE_UNAVAILABLE") {
          toast.error("Service temporarily unavailable. Try again.");
          return;
        }

        // Show markdown answer if provided
        if (data.answer) {
          dispatch(
            addMessage({
              role: "assistant",
              content: data.answer,
            }),
          );
          return;
        }

        toast.error(data.message || "Something went wrong");
        return;
      }

      /* ─── Success ─────────────────────────────────────────────── */
      dispatch(setArtifacts(data?.artifacts || []));
      dispatch(
        addMessage({
          role: "assistant",
          content: data?.answer || "",
          images: data?.images || [],
          artifacts: data?.artifacts || [],
        }),
      );

      /* ─── Update credits in user state ───────────────────────── */
      if (typeof data.creditRemaining === "number") {
        // If you have a Redux action to update user credits:
        // dispatch(updateUserCredits(data.creditRemaining));
      }

      /* ─── Show credit charge toast ───────────────────────────── */
      if (data.creditCharged) {
        toast.success(
          `−${data.creditCharged} credits · ${data.creditRemaining} remaining`,
          { duration: 2500 },
        );
      }
    } catch (error) {
      console.error("handleSendMessage failed:", error);

      const status = error?.response?.status;
      const data = error?.response?.data;

      // Handle credit errors thrown as HTTP status
      if (status === 402) {
        toast.error(
          `You need ${data?.required || "more"} credits. You have ${data?.available || 0}.`,
        );
        navigate("/billing");
        return;
      }

      if (status === 403) {
        toast.error("Your plan has expired. Please renew.");
        navigate("/billing");
        return;
      }

      if (status === 503) {
        toast.error("Service unavailable. Try again.");
        return;
      }

      dispatch(
        addMessage({
          role: "assistant",
          content:
            data?.message ||
            "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।",
        }),
      );
    } finally {
      dispatch(setLoading(false));
      setIsSending(false);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  Keyboard send (Enter)                                     */
  /* ─────────────────────────────────────────────────────────── */

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  Derived state                                             */
  /* ─────────────────────────────────────────────────────────── */

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent);
  const placeholder = currentAgent?.placeholder || "Ask Anything...";
  const canSend = (!!value.trim() || !!selectedFile) && !isSending;

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]">
      <div className="flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">
        {/* Selected file preview */}
        {selectedFile && (
          <div className="flex items-center justify-between bg-white/[0.06] px-3 py-1.5 rounded-lg text-xs text-slate-300 border border-white/[0.08]">
            <span className="truncate flex items-center gap-2">
              {selectedFile.type?.startsWith("image/") ? "🖼️" : "📄"}{" "}
              {selectedFile.name}
              <span className="text-slate-500">
                ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-slate-400 hover:text-red-400 ml-2"
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Agent selector */}
        <div className="flex gap-2 pr-2 flex-wrap">
          {AGENTS.map((agent) => {
            const isActive = selectedAgent === agent.id;
            const Icon = agent.icon;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent.id)}
                className={`
                  flex-shrink-0 inline-flex cursor-pointer items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all
                  ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
                  }
                `}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />
                {agent.label}
              </button>
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          value={value}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          disabled={isSending}
        />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
            />

            {/* Paperclip */}
            <div className="relative group flex items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-40"
                aria-label="Attach file"
              >
                <Paperclip size={16} />
              </button>

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex px-2.5 py-1 bg-slate-800 text-slate-200 text-[11px] rounded whitespace-nowrap shadow-md z-10 border border-white/[0.1]">
                Upload PDF or Image (Max 20MB)
              </div>
            </div>

            {/* Mic (placeholder) */}
            <button
              type="button"
              disabled
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-40"
              aria-label="Voice input (coming soon)"
            >
              <Mic size={16} />
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!canSend}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none transition-all duration-150 ${
              canSend
                ? "bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white cursor-pointer"
                : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
            }`}
            aria-label="Send"
          >
            {isSending ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;