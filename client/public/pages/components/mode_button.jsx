import { BsSunFill } from "react-icons/bs"; 
import React from 'react'
import { FaLaptop, FaMoon } from 'react-icons/fa'
import useMode from "../sections/profile/context/mode";

const ModeButton = () => {
  
  const setMode = useMode((state) => state.setMode)
  const mode = useMode((state) => state.mode)

  const modeButtons = [
    {
      value: '',
      icon: <BsSunFill />
    },

    {
      value: 'dark',
      icon: <FaMoon />
    },

    {
      value: 'system',
      icon: <FaLaptop />
    },
  ]

  
  
  return (
    <div className="flex flex-row items-center gap-[.8rem] place-content-center">
      {
        modeButtons.map((btn,i) => {
          return (
            <button 
              key={i}
              className={`
                transition-all duration-[.1s] ease
                ${mode === btn.value? 
                  'bg-gradient-to-r from-[var(--active-color)]/20 to-transparent text-[var(--active-color)] place-items-center w-10 h-10 rounded-full' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'} 
              `}
              onClick={() => setMode(btn.value)}
            > {btn.icon} </button>
          )
        })
      }
    </div>
  )
}

export default ModeButton
