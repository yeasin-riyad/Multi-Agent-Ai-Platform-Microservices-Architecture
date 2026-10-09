import {
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useDispatch } from "react-redux";



const SidebarConversationItem = ({
  conversation,
  active,
  onClick,
  onDelete,
}) => {

  const dispatch=useDispatch();
  const handleDelete = (event) => {
    // Prevent conversation selection
    event.stopPropagation();

    onDelete?.();
  };

  return (
    <div
      className={`
        group
        flex
        items-center
        gap-2
        w-full
        rounded-lg
        px-3
        py-2.5
        mb-1
        cursor-pointer
        transition-colors

        ${
          active
            ? "bg-indigo-500/10 text-white"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
        }
      `}
      onClick={onClick}
    >
      {/* Conversation icon */}
      <MessageSquare
        className={`
          h-4
          w-4
          shrink-0
          ${
            active
              ? "text-indigo-400"
              : "text-slate-500"
          }
        `}
      />

      {/* Conversation title */}
      <span
        className="
          flex-1
          min-w-0
          truncate
          text-sm
        "
        title={conversation?.title || "New Conversation"}
      >
        {conversation?.title || "New Conversation"}
      </span>

      {/* Delete button */}
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete conversation"
        title="Delete conversation"
        className="
          shrink-0
          p-1
          rounded-md
          text-slate-500
          opacity-0
          group-hover:opacity-100
          hover:bg-red-500/10
          hover:text-red-400
          focus:opacity-100
          transition-all
        "
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default SidebarConversationItem;