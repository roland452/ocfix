import React, { useState } from 'react';
import { MdAttachEmail } from "react-icons/md";
import { TbFaceId } from "react-icons/tb";
import useLoginContext from './context';
import useToast from '../../../context/toast';

const Email = () => {
  const setToast = useToast((state) => state.setToast);
  const [submitting, setSubmitting] = useState(false);  
  const email = useLoginContext((state) => state.email);
  const setEmail = useLoginContext((state) => state.setEmail);
  const setLoginActiveSection = useLoginContext((state) => state.setLoginSection);

  const submitEmail = () => {
    if (!email) return setToast('Email cannot be empty');
    setSubmitting(true);
    setTimeout(() => {
        setLoginActiveSection('faceId'); // Moves to Face Verification
    }, 1000);
  };

  return (
    <div className='flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className="text-center space-y-1">
        <p className='text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]'>Verification Step</p>
        <p className='text-xs text-gray-500 italic'>Enter email to initialize facial scanner</p>  
      </div>

      <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
        <MdAttachEmail className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
        <input 
          className="bg-transparent outline-none w-full text-sm dark:text-white font-medium"
          type="text" placeholder='Associated email'
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button 
        className="w-full py-4 bg-red-400 rounded-2xl font-bold text-white shadow-lg shadow-red-400/20 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2"
        onClick={submitEmail}
      >
        {submitting ? 'Initializing...' : <><TbFaceId className='text-2xl' /> Open Scanner</>}
      </button>

      <button 
        className='text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors underline decoration-1 underline-offset-4'
        onClick={() => setLoginActiveSection('login')}
      >
        Back to Password
      </button>
    </div>
  );
};

export default Email;
