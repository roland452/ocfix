import React from 'react';
import { MdManageSearch, MdOutlineMultilineChart } from "react-icons/md"; 
import { BsChatDotsFill, BsArrowLeft } from "react-icons/bs"; 
import { IoMdLogOut, IoMdBookmark } from "react-icons/io"; 
import { FaUserCog } from "react-icons/fa"; 
import { HiFlag } from "react-icons/hi"; 
import useSection from "../../context/sectionState";
import useNavActive from "../../context/navContext";

const NavButton = () => {
  const navBtn = [
    { icon: <MdOutlineMultilineChart />, section: 'dashboard' },
    { icon: <MdManageSearch />, section: 'jobs' },
    { icon: <IoMdBookmark />, section: 'saved jobs' },
    { icon: <HiFlag />, section: 'appointments' },
    { icon: <FaUserCog />, section: 'profile' },
    { icon: <BsChatDotsFill />, section: 'chat' },
  ];

  const activeSection = useSection((state) => state.activeSection);
  const setActiveSection = useSection((state) => state.setActiveSection);

  return (
    <div className='relative flex flex-col h-full justify-between p-4 '>
      
      <div className='flex flex-col gap-2 mt-8 overflow-y-auto scrollbar-hide'>
        {navBtn.map((item, i) => {
          const isActive = activeSection === item.section;
          return (
            <button 
              key={i}
              onClick={() => setActiveSection(item.section)}
              className={`
                relative flex items-center gap-4 w-full h-12 px-4 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-gradient-to-r from-[var(--active-color)]/20 to-transparent text-[var(--active-color)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-[var(--active-color)] rounded-r-full shadow-[0_0_10px_var(--active-color)]" />
              )}

              <span className={`text-xl transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:translate-x-1'}`}>
                {isActive ? item.icon : ''} 
              </span>
              
              <span className={`capitalize text-sm font-medium tracking-wide`}>
                {item.section}
              </span>

              {/* Subtle Glow for Active Item */}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-[var(--active-color)] rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Section at Bottom */}
      <div className="pt-6 border-t border-white/5">
        <button className="flex items-center gap-4 w-full h-12 px-4 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300">
          <IoMdLogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default NavButton;
