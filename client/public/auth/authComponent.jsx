import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TbFaceId } from "react-icons/tb"; 
import { FcOpenedFolder } from "react-icons/fc"; 
import { FaHome } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";

import InputComponent from "./inputComponent";
import AuthButtons from "./buttons/authButtons";
import useLoginContext from "./components/login/context";

const AuthComponent = () => {
  const [authSection, setAuthSection] = useState('login')
  const setLoginActiveSection = useLoginContext((state) => state.setLoginSection)
  const loginActiveSection = useLoginContext((state) => state.loginSection)
  const email = useLoginContext((state) => state.email)

  useEffect(() => {
    if(!email) return setLoginActiveSection('login')
  }, [])

  return (
    // h-screen and overflow-hidden prevent the page from scrolling
    <div className='h-screen w-full bg-[#f8f9fa] dark:bg-[var(--d-bg)] flex items-center justify-center p-4 overflow-hidden'>
      
      {/* Home Navigation - Subtle in light mode, glowing in dark */}
      <Link 
        to={'/dashboard'} 
        className="fixed top-6 right-6 p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm text-lg hover:scale-110 transition-all z-50 text-gray-600 dark:text-white"
      > 
        <FaHome /> 
      </Link>

      {/* Main Auth Card */}
      <div className='relative w-full max-w-[420px] bg-white dark:bg-[#0a0a0a] shadow-2xl shadow-gray-200 dark:shadow-black rounded-[2.5rem] p-8 overflow-hidden border border-gray-100 dark:border-white/5 flex flex-col justify-between'>
        
        {/* Face ID Quick Toggle */}
        { 
          loginActiveSection !== 'email' && authSection === 'login' && (
            <div 
              onClick={() => setLoginActiveSection('email')}
              className="absolute top-6 left-6 p-2.5 rounded-xl bg-[var(--active-color)]/10 text-[var(--active-color)] cursor-pointer hover:bg-[var(--active-color)]/20 transition-colors"
              title="Login with Face ID"
            >
              <TbFaceId className="text-xl" />
            </div>
          )
        }

        {/* Brand Header - Reduced margins to prevent scroll */}
        <div className='flex flex-col items-center gap-1 mb-6 mt-2'>
            <div className="text-4xl"><FcOpenedFolder /></div>
            <h1 className='text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase'>
              Octfix
            </h1>
            <p className='text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]'>
              Service Marketplace
            </p>
        </div>

        {/* Section Switcher */}
        <div className="mb-6">
          <AuthButtons 
              authSection={authSection}
              setAuthSection={setAuthSection}
          />
        </div>

        {/* Form Inputs Container - Main interaction area */}
        <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
          <InputComponent 
              authSection={authSection}
          />
        </div>

        {/* Security Footer - Compact */}
        <div className="mt-6 flex items-center justify-center gap-2 pt-4 border-t border-gray-50 dark:border-white/5">
          <MdSecurity className="text-gray-300 dark:text-gray-600 text-base" />
          <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
            Biometric Secured
          </p>
        </div>

        {/* Adaptive Background Accents */}
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--active-color)]/10 dark:bg-[var(--active-color)]/5 rounded-full blur-2xl -z-1" />
      </div>
    </div>
  )
}

export default AuthComponent
