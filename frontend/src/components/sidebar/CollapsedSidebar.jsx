import {
  MessageSquare,
  PanelRight,
  Plus,
  User,
} from "lucide-react";

const CollapsedSidebar = ({
  conversations,
  selectedConversation,
  userData,
  imageError,
  onImageError,
  onExpand,
  onCreateConversation,
  onSelectConversation,
}) => {
  return (
    <div
      className="
        hidden
        lg:flex
        flex-col
        items-center
        w-[56px]
        min-w-[56px]
        h-screen
        bg-[#0d0f14]
        border-r
        border-white/[0.06]
        py-4
        gap-1
        shrink-0
      "
    >
      {/* Expand */}
      <button
        type="button"
        onClick={onExpand}
        aria-label="Expand sidebar"
        className="
          flex
          items-center
          justify-center
          w-9
          h-9
          rounded-xl
          text-slate-500
          hover:text-slate-200
          hover:bg-white/[0.05]
          transition-colors
          duration-150
          bg-transparent
          border-none
          cursor-pointer
          mb-1
        "
      >
        <PanelRight size={18} />
      </button>

      {/* New conversation */}
      <button
        type="button"
        onClick={onCreateConversation}
        aria-label="New conversation"
        className="
          flex
          items-center
          justify-center
          w-9
          h-9
          rounded-xl
          text-slate-500
          hover:text-slate-200
          hover:bg-white/[0.05]
          transition-colors
          duration-150
          bg-transparent
          border-none
          cursor-pointer
        "
      >
        <Plus size={17} />
      </button>

      {/* Conversations */}
      <div
        className="
          flex-1
          w-full
          overflow-y-auto
          px-2
          pb-2
          pt-5
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {conversations.map((conversation) => {
          const active =
            selectedConversation?._id ===
            conversation?._id;

          return (
            <button
              type="button"
              key={conversation?._id}
              onClick={() =>
                onSelectConversation(conversation)
              }
              aria-label={
                conversation?.title ||
                "Conversation"
              }
              className={`
                w-full
                flex
                items-center
                justify-center
                cursor-pointer
                mb-0.5
                px-2
                py-2.5
                rounded-[10px]
                border
                transition-colors
                duration-150

                ${
                  active
                    ? "bg-indigo-500/10 border-indigo-500/[0.18]"
                    : "bg-transparent border-transparent"
                }
              `}
            >
              <div
                className={`
                  flex
                  items-center
                  justify-center
                  shrink-0
                  w-[20px]
                  h-[20px]
                  rounded-lg

                  ${
                    active
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-white/[0.05] text-slate-500"
                  }
                `}
              >
                <MessageSquare size={13} />
              </div>
            </button>
          );
        })}
      </div>

      {/* User avatar */}
      <div className="relative shrink-0">
        {userData?.avatar && !imageError ? (
          <img
            className="
              w-9
              h-9
              rounded-[10px]
              object-cover
              border-2
              border-indigo-500/25
            "
            src={userData.avatar}
            alt="User avatar"
            onError={onImageError}
          />
        ) : (
          <div
            className="
              w-9
              h-9
              rounded-[10px]
              bg-white/[0.06]
              flex
              items-center
              justify-center
            "
          >
            <User
              size={15}
              className="text-slate-400"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsedSidebar;