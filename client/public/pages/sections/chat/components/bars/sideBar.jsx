import React from 'react';
import { FiUser, FiTrash2, FiFlag, FiXCircle, FiFile } from "react-icons/fi"; // Added icons for modern feel
import useChat from '../../context/chat';

const SideBar = () => {
    const activeChat = useChat((state) => state.activeChat)
    const setFundProjectModal = useChat((state) => state.setFundProjectModal)
    const sideBarActive = useChat((state) => state.sideBarActive)

    const userType = activeChat?.userType

    // Structured options with icons to match the "Hire" button energy
    const options = [
        { label: 'View Profile', icon: <FiUser />, color: 'hover:text-blue-500' },
        { label: 'End Chat', icon: <FiXCircle />, color: 'hover:text-orange-500' },
        { label: 'Policy', icon: <FiFile />, color: 'hover:text-green-700' },
        { label: 'Report', icon: <FiFlag />, color: 'hover:text-red-600' },
    ];

    return (
        <div className={`
            absolute right-4 top-20 z-30 w-56
            transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${sideBarActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}
            p-3 rounded-2xl bg-white dark:bg-zinc-900 
            shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
            border border-slate-100 dark:border-white/5
        `}>
            {/* Primary Action Section */}
            { userType === 'poster' && (
                <div className="pb-3 mb-3 border-b border-slate-100 dark:border-white/5">
                    <button 
                        disabled={activeChat?.isHired}
                        onClick={() => setFundProjectModal(true)}
                        className={`w-full py-3 px-4 bg-[var(--active-color)] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[var(--active-color)]/20 active:scale-95 transition-all ${activeChat?.isHired? 'opacity-40' : 'opacity-100'}`}>
                        {activeChat?.isHired? 'Hired' : 'Hire Developer'}
                    </button>
                </div>
            )}

            {/* General Options Section */}
            <div className="flex flex-col gap-1">
                {options.map((item, index) => (
                    <button 
                        key={index}
                        className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg
                            text-slate-600 dark:text-slate-400 text-[13px] font-medium
                            transition-all duration-200 bg-transparent
                            hover:bg-slate-50 dark:hover:bg-white/5 ${item.color}
                        `}
                    >
                        <span className="text-base opacity-70">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SideBar;
