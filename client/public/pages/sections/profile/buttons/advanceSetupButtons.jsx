import { BsFillStarFill } from "react-icons/bs"; 
import { BsMegaphoneFill } from "react-icons/bs"; 
import { IoMdHelp } from "react-icons/io"; 
import { RiFontColor } from "react-icons/ri"; 
import { IoIosColorPalette } from "react-icons/io"; 
import React from 'react'
import useSettingPopup from "../context/setting-popup-context";

const AdvanceSetupButtons = () => {
  const advanceSetUps = [
         
         {
             icon: <RiFontColor />,
             text:'font style'
         },
         
         {
             icon: <BsFillStarFill />,
             text:'review and feedback'
         },
         
     ]

     const setSection = useSettingPopup((state) => state.setSection)
  return (
        <ul className="grid grid-cols-1 gap-4 p-4">
            {advanceSetUps.map((setup, i) => (
                <li 
                    key={i}
                    onClick={() => setSection(setup.text)}
                    className="
                        group flex flex-col gap-3 p-5 rounded-3xl cursor-pointer
                        bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5
                        hover:border-[var(--active-color)] hover:shadow-xl hover:shadow-[var(--active-color)]/10
                        hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-10 h-10 rounded-xl bg-[var(--active-color)]/10 text-[var(--active-color)] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {setup.icon}
                    </div>
                    <span className="text-sm font-bold capitalize text-slate-700 dark:text-slate-200">{setup.text}</span>
                </li> 
            ))}
        </ul>
    );
}

export default AdvanceSetupButtons
