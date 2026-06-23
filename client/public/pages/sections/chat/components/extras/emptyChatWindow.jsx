import React from 'react';
import { HiOutlineUserPlus, HiOutlineChatBubbleBottomCenterText } from "react-icons/hi2";

const EmptyChatWindow = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-dashed border-zinc-300 dark:border-zinc-700">
        <HiOutlineChatBubbleBottomCenterText size={28} className="text-zinc-400" />
      </div>
      
      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
        No Conversations Yet
      </h4>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 mb-6 leading-tight">
        Your recent chats will appear here once you start a conversation.
      </p>

      <button className="flex items-center gap-2 py-2 px-4 bg-[var(--active-color)] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[var(--active-color)]/20">
        <HiOutlineUserPlus size={16} />
        Find Someone
      </button>
    </div>
  );
};

export default EmptyChatWindow;
