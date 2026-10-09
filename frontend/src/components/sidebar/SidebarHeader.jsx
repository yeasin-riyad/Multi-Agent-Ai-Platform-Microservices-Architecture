import {
  PanelLeftIcon,
  PenSquare,
  X,
} from "lucide-react";

const SidebarHeader = ({
  onCollapse,
  onNewChat,
  onClose,
}) => {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        sm:gap-2.5
        px-3
        sm:px-4
        py-3
        sm:py-4
        border-b
        border-white/[0.06]
        shrink-0
      "
    >
      {/* Desktop collapse */}
      <button
        type="button"
        onClick={onCollapse}
        aria-label="Collapse sidebar"
        className="
          hidden
          lg:flex
          items-center
          justify-center
          w-7
          h-7
          rounded-lg
          text-slate-500
          hover:text-slate-200
          hover:bg-white/[0.05]
          transition-colors
          duration-150
          bg-transparent
          border-none
          cursor-pointer
          shrink-0
        "
      >
        <PanelLeftIcon size={17} />
      </button>

      {/* Logo */}
      <span
        className="
          text-[15px]
          sm:text-[16px]
          font-semibold
          text-slate-100
          tracking-tight
          flex-1
          min-w-0
          truncate
        "
      >
        AgentixAI
      </span>

      {/* Free badge */}
      <span
        className="
          hidden
          sm:inline-flex
          text-[9px]
          sm:text-[10px]
          font-medium
          text-indigo-400
          bg-indigo-500/10
          border
          border-indigo-500/20
          px-1.5
          sm:px-2
          py-0.5
          rounded-full
          tracking-wide
          shrink-0
        "
      >
        free
      </span>

      {/* Desktop new chat */}
      <button
        type="button"
        onClick={onNewChat}
        aria-label="New chat"
        className="
          hidden
          lg:flex
          items-center
          justify-center
          w-7
          h-7
          rounded-lg
          text-slate-500
          hover:text-slate-200
          hover:bg-white/[0.05]
          transition-colors
          duration-150
          bg-transparent
          border-none
          cursor-pointer
          shrink-0
        "
      >
        <PenSquare size={14} />
      </button>

      {/* Mobile close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close sidebar"
        className="
          flex
          lg:hidden
          items-center
          justify-center
          w-8
          h-8
          rounded-lg
          text-slate-500
          hover:text-slate-200
          hover:bg-white/[0.05]
          transition-colors
          duration-150
          bg-transparent
          border-none
          cursor-pointer
          shrink-0
        "
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default SidebarHeader;