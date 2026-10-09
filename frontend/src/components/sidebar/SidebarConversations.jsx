import SidebarConversationItem from "./SidebarConversationItem";

const SidebarConversations = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onDeleteConversation,
}) => {
  return (
    <>
      {/* Section title */}
      <div
        className="
          px-4
          sm:px-5
          pt-3
          sm:pt-4
          pb-1.5
          text-[10px]
          sm:text-[10.5px]
          font-semibold
          uppercase
          tracking-widest
          text-slate-600
          shrink-0
        "
      >
        {conversations.length === 0
          ? "No Recent Conversations"
          : "Recents"}
      </div>

      {/* Conversation list */}
      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-2
          sm:px-2.5
          pb-2
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {conversations.map((conversation) => (
          <SidebarConversationItem
            key={conversation?._id}
            conversation={conversation}
            active={
              selectedConversation?._id ===
              conversation?._id
            }
            onClick={() =>
              onSelectConversation(conversation)
            }
            onDelete={() =>
              onDeleteConversation(conversation?._id)
            }
          />
        ))}
      </div>
    </>
  );
};

export default SidebarConversations;