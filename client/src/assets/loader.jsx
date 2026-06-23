import { AiOutlineLoading3Quarters } from "react-icons/ai"; 
import { RiLoader2Fill } from "react-icons/ri"; 
import React from 'react'

const LoaderAnimation = () => {
  return (

      <div className="flex flex-col items-center justify-center h-64 mt-20 fixed top-[40%] left-[50%] translate-[-50%]">
        <AiOutlineLoading3Quarters className="animate-spin text-[var(--active-color)] mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing page...</p>
      </div>
  )
}

export default LoaderAnimation
