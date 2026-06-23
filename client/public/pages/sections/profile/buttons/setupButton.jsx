import { BsFillChatDotsFill } from "react-icons/bs"; 
import { RxActivityLog } from "react-icons/rx"; 
import { GrMail } from "react-icons/gr"; 
import { RiUserSearchFill } from "react-icons/ri"; 
import { RiShieldKeyholeFill } from "react-icons/ri"; 
import { FaUserEdit, FaInfoCircle } from "react-icons/fa"; 
import React from 'react'
import { MdSettings } from "react-icons/md"; 
import useSettingPopup from "../context/setting-popup-context";

const SetupButton = () => {
    const setUps = [
        {
            icon: <FaInfoCircle />,
            text:'info'
        },
        {
            icon: <FaUserEdit />,
            text:'profile'
        },
        {
            icon: <RiShieldKeyholeFill />,
            text:'security'
        },
        {
            icon: <RiUserSearchFill />,
            text:'avatars'
        },
        {
            icon: <GrMail />,
            text:'notices'
        },
       
    ]

    const setSection = useSettingPopup((state) => state.setSection)

   

  return (
        <ul className="grid grid-cols-2 gap-4 p-4">
            {setUps.map((setup, i) => (
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

export default SetupButton
