import { BiChevronUp, BiChevronDown, BiVideo } from "react-icons/bi";
import { MdOutlineCall } from "react-icons/md";
import { BsArrowLeft } from "react-icons/bs";
import React from 'react';
import useChat from '../context/chat';
import useSocket from '../context/socketContext'; // ← zustand socket store

const ChatHeader = () => {
  const setActiveChatId = useChat((state) => state.setActiveChatId);
  const setSideBarActive = useChat((state) => state.setSideBarActive);
  const sideBarActive = useChat((state) => state.sideBarActive);
  const activeChat = useChat((state) => state.activeChat);
  const isOnline = useSocket((state) => state.isOnline);

  const otherPerson = activeChat?.userType === 'poster'
    ? activeChat?.clientId
    : activeChat?.approvedBy;

  const otherPersonId = activeChat?.userType === 'poster'
    ? activeChat?.clientId?._id
    : activeChat?.approvedBy?._id;

  // Real online check
  const online = isOnline(otherPersonId);

  return (
    <div className="flex justify-between items-center md:px-4 py-2 top-0 z-20 bg-[var(--l-bg)] dark:bg-[var(--d-bg)]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveChatId('')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <BsArrowLeft className="text-xl" />
        </button>

        <div className="flex gap-3 items-center cursor-pointer group">
          {/* Avatar with online dot */}
          <div className="relative w-10 h-10">
            <div className="w-10 h-10 rounded-full ring-2 ring-[var(--active-color)]/20 p-0.5 transition-all group-hover:ring-[var(--active-color)]">
              <div className="w-full h-full capitalize rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center font-bold text-[var(--active-color)]">
                {!otherPerson?.image
                  ? otherPerson?.name?.[0]
                  : <img src={otherPerson.image} alt="" className="w-full h-full object-cover" />
                }
              </div>
            </div>
            {/* Online indicator dot */}
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[var(--d-bg)] ${online ? 'bg-green-500' : 'bg-zinc-400'}`} />
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-sm capitalize leading-tight">
              {otherPerson?.name}
            </span>
            <span className={`text-[10px] font-medium ${online ? 'text-green-500' : 'text-zinc-400'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full mr-2">
          <button className="p-2 bg-white dark:bg-white/10 rounded-full transition-all text-slate-900 dark:text-slate-300">
            <BiVideo className="text-lg" />
          </button>
          <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-all text-slate-900 dark:text-slate-300">
            <MdOutlineCall className="text-lg" />
          </button>
        </div>

        <button
          onClick={() => setSideBarActive(!sideBarActive)}
          className={`p-2 rounded-full transition-all ${sideBarActive ? 'bg-[var(--active-color)] text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          {!sideBarActive ? <BiChevronDown className="text-2xl" /> : <BiChevronUp className="text-2xl" />}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;