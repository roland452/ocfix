import { RiFingerprintFill, RiUserShared2Line, RiShieldKeyholeLine, RiHistoryLine } from "react-icons/ri";
import { MdFace, MdDevices, MdPassword } from "react-icons/md";
import React, { useState } from 'react';
import SecurityPopup from "./securitypopup";

const Security = () => {

  const securityOptions = [
    { id: 'face', text: 'Facial Recognition', icon: <MdFace />, desc: 'Biometric 3D mapping' },
    { id: 'fingerprint', text: 'Fingerprint ID', icon: <RiFingerprintFill />, desc: 'Touch authentication' },
    { id: 'password', text: 'Password & Pin', icon: <MdPassword />, desc: 'Traditional access' },
    { id: '2fa', text: 'Two-Factor (2FA)', icon: <RiShieldKeyholeLine />, desc: 'SMS & Authenticator' },
    { id: 'devices', text: 'Linked Devices', icon: <MdDevices />, desc: 'Manage active sessions' },
    { id: 'sessions', text: 'Login History', icon: <RiHistoryLine />, desc: 'Review recent activity' },
    { id: 'permissions', text: 'App Permissions', icon: <RiUserShared2Line />, desc: 'Control data access' },
  ];

  const [section, setSection] = useState('')

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="px-0">
        <h2 className="text-2xl font-bold tracking-tight">Security Center</h2>
        <p className="text-gray-400 text-sm">Manage your biometrics and account protection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2  gap-3 overflow-y-auto pr-2 custom-scrollbar [&::-webkit-scrollbar]:hidden">
        {securityOptions.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className="group flex items-center justify-between p-4 rounded-2xl 
                      bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-[var(--active-color)]/50 
                       hover:bg-white/[0.08] transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4">
              {/* Icon with soft glow */}
              <div className="p-3 rounded-xl bg-black/20 text-2xl text-[var(--active-color)] 
                              group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              
              <div>
                <h3 className="font-medium text-sm md:text-base">{item.text}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>

            {/* Visual indicator for "Clickable" */}
            <div className="flex items-center gap-3">
               <span className="hidden md:block text-[10px] text-gray-600 uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Configure
               </span>
               <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[var(--active-color)] transition-colors"></div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Quick Security Tip */}
      <div className="mt-auto px-4 py-1 md:p-4 mb-6 rounded-2xl bg-[var(--active-color)]/10 border border-[var(--active-color)]/20">
        <p className="text-[var(--active-color)] text-xs leading-relaxed">
          <strong>Tip:</strong> You recently tested your biometric login with a recognition threshold of 0.45. Ensure your environment is well-lit for best results.
        </p>
      </div>
      <SecurityPopup section={section} setSection={setSection} />
    </div>
  );
};

export default Security;
