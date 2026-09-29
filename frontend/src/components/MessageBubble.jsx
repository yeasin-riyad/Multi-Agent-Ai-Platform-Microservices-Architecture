import Markdown from 'react-markdown'

const MessageBubble = ({ role, content,images }) => {
  const isUser = role === "user";
  
  // ফিক্সড: ডাইনামিক স্ট্রিং ইন্টারপোলেশন ব্র্যাকেট পজিশন ঠিক করা হয়েছে
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed
        ${isUser
          ? "bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
          : " text-slate-200 rounded-tl-sm"
        }`
      }>
        <Markdown>
          {content}
        </Markdown>
      </div>
    </div>
  );
};

export default MessageBubble;
