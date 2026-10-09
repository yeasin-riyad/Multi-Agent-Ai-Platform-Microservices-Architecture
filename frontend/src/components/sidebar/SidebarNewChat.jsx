import { Plus } from "lucide-react";

const SidebarNewChat = ({ onNewChat }) => {
  return (
    <div
      className="
        px-3
        sm:px-4
        pt-3
        sm:pt-4
        pb-1
        shrink-0
      "
    >
      <button
        type="button"
        onClick={onNewChat}
        className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          text-[13px]
          sm:text-sm
          font-medium
          text-white
          bg-gradient-to-br
          from-indigo-500
          to-violet-700
          rounded-xl
          py-2.5
          sm:py-[10px]
          border-none
          cursor-pointer
          hover:opacity-90
          active:scale-[0.99]
          transition-all
          duration-150
        "
      >
        <Plus size={15} />

        <span>New Chat</span>
      </button>
    </div>
  );
};

export default SidebarNewChat;