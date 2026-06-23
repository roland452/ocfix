import React from 'react';
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

const EmptyChat = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
      <div className="relative mb-6">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-[var(--active-color)] opacity-10 blur-3xl rounded-full animate-pulse" />
        
        {/* <div className="flex items-center justify-center w-24 h-24  rounded-full bg-white dark:bg-zinc-900 shadow-xl border border-zinc-100 dark:border-zinc-800">
          <HiOutlineChatBubbleLeftRight 
            size={48} 
            className="text-[var(--active-color)] opacity-80" 
          />
        </div> */}
      </div>

      <h3 className="text-xl font-bold text-zinc-500 dark:text-zinc-100 mb-2">
        Your Messages
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
        Select a conversation from the list to start chatting or view your history.
      </p>

      {/* Optional: Add a small badge showing security status */}
      <div className="mt-8 flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          End-to-End Encrypted
        </span>
      </div>
    </div>
  );
};

export default EmptyChat;
