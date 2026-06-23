import { GiCombinationLock } from "react-icons/gi"; 
import { FaSpinner, FaShieldAlt } from "react-icons/fa"; 
import React, { useState } from 'react';
import axios from "axios";
import { MdOutlineLockOpen, MdOutlineLock } from "react-icons/md";
import useToast from "../../../../../context/toast";

const Password = () => {
  const setToast = useToast((state) => state.setToast);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  
  // Maintained your exact backend logic
  async function updatePassword() {

    setIsLoading(true);
    try {
      const res = await axios.post('/api/password-update',
        { password, newPassword },
        { withCredentials: true }
      );
      const data = await res.data;
      
      setIsLoading(false);
      setToast(data.message);
      
      // Clear inputs on success
      setPassword('');
      setNewPassword('');
    } catch (error) {
      setIsLoading(false);
      setToast(error.response?.data?.message || error.message);
    }
  }

  return (
    <div className="p-6 h-full flex flex-col gap-1 md:gap-5 max-w-xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-black dark:text-white">Security Credentials</h1>
        <p className="text-gray-500 text-sm">Update your password to keep your Octfix account secure.</p>
      </div>

      {/* Main Form Area */}
      <div className="flex flex-col gap-6 bg-black/5 dark:bg-white/5 p-8 rounded-[2.5rem] border border-black/6 dark:border-white/5 shadow-inner">
        
        {/* Visual Indicator */}
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 bg-[var(--active-color)]/10 rounded-2xl flex items-center justify-center text-3xl text-[var(--active-color)]">
            <GiCombinationLock />
          </div>
        </div>

        {/* Input Group: Current Password */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">
            Current Password
          </label>
          <div className="relative flex items-center">
            <MdOutlineLockOpen className="absolute left-4 text-xl text-gray-400" />
            <input 
              className="w-full bg-black/5 dark:bg-black/20 border border-transparent focus:border-[var(--active-color)]/30 rounded-2xl p-4 pl-12 outline-none transition-all text-sm"
              type="password" 
              placeholder="Enter current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Input Group: New Password */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">
            New Password
          </label>
          <div className="relative flex items-center">
            <MdOutlineLock className="absolute left-4 text-xl text-gray-400" />
            <input 
              className="w-full bg-black/5 dark:bg-black/20 border border-transparent focus:border-[var(--active-color)]/30 rounded-2xl p-4 pl-12 outline-none transition-all text-sm"
              type="password" 
              placeholder="Create new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          className={`w-full py-4 mt-2 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            !password.trim() || !newPassword.trim() || isLoading
            ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed' 
            : 'bg-[var(--active-color)] text-black shadow-lg shadow-[var(--active-color)]/20 hover:scale-[1.02] active:scale-95'
          }`}
          disabled={!password.trim() || !newPassword.trim() || isLoading}
          onClick={updatePassword}
        >
          {isLoading ? (
            <FaSpinner className="animate-spin text-xl" />
          ) : (
            <>
              <FaShieldAlt className="text-lg" />
              <span>Update Password</span>
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <p className="text-center text-[11px] text-gray-500 leading-relaxed px-1 md:px-3">
        Passwords must be at least 8 characters. Changing your password will not log you out of your current session on this device.
      </p>
    </div>
  );
};

export default Password;
