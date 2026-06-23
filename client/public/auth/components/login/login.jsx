import React from 'react';
import { HiOutlineFingerPrint } from "react-icons/hi"; 
import { FaSpinner } from "react-icons/fa"; 
import { RiLockPasswordFill } from "react-icons/ri"; 
import { MdAttachEmail } from "react-icons/md"; 

const LoginContent = ({ email, setEmail, password, setPassword, handleSubmit, submitting }) => {
  return (
    <div className='flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className="space-y-4">
        {/* Email Input */}
        <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
          <MdAttachEmail className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
          <input 
            className="bg-transparent outline-none w-full text-sm dark:text-white"
            type="text" placeholder='Email address'
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
          <RiLockPasswordFill className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
          <input 
            className="bg-transparent outline-none w-full text-sm dark:text-white"
            type="password" placeholder='Password'
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <button 
        className="w-full py-4 bg-red-400 rounded-2xl font-bold text-white shadow-lg shadow-red-400/20 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2"
        onClick={() => handleSubmit()}
      >
        {submitting ? <FaSpinner className="animate-spin" /> : 'Sign In'}
      </button>

      {/* Biometric Shortcut */}
      <div className="flex items-center justify-center pt-2">
        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-400 hover:text-[var(--active-color)] hover:bg-[var(--active-color)]/10 cursor-pointer transition-all">
          <HiOutlineFingerPrint className="text-3xl" />
        </div>
      </div>
    </div>
  );
};

export default LoginContent;
