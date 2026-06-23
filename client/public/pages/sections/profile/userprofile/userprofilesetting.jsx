import React, { useState } from 'react';
import { BsArrowRight } from "react-icons/bs";
import { FaSpinner, FaCheckCircle } from "react-icons/fa"; 
import axios from 'axios';
import useToast from '../../../../context/toast';
import useRefresh from '../../../../context/refresh';

const Userprofilesetting = ({ inputIndex, profileSettings, profileForm, handleEditChange, removeInput }) => {
  const setToast = useToast((state) => state.setToast);
  const setRefresh = useRefresh((state) => state.setRefresh);
  const refresh = useRefresh((state) => state.refresh);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to get current setting object safely
  const currentSetting = profileSettings[inputIndex || 0];

  async function saveChanges(settings) {
    if (!profileForm?.trim()) return setToast(`${settings} can't be empty`);
    setIsLoading(true);
    try {
      const res = await axios.patch(
        `/api/update-${settings}`,
        { settings: profileForm },
        { withCredentials: true }
      );
      setToast(res.data.message);
      setIsLoading(false);
      setRefresh(!refresh);
    } catch (error) {
      setIsLoading(false);
      setToast(error.message);
    }
  }

  return (
    <div className={`
      fixed inset-0 z-50 flex flex-col items-center
      bg-[var(--l-bg)] dark:bg-[var(--d-bg)] text-slate-900 dark:text-white
      transition-transform duration-500 ease-in-out
      ${inputIndex !== null ? 'translate-x-0' : 'translate-x-full'}
    `}>
      
      {/* Header / Close Action */}
      <div className="w-full flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md">
        <h2 className="text-xl font-semibold capitalize">Edit {currentSetting.settings}</h2>
        <button 
          onClick={removeInput}
          className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          <BsArrowRight className="text-2xl" />
        </button>
      </div>

      <div className="flex flex-col items-center w-full max-w-md gap-10 p-8 mt-10">
        
        {/* Decorative Central Icon */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl bg-[var(--active-color)]/10 border-2 border-[var(--active-color)]/30 flex items-center justify-center text-6xl text-[var(--active-color)] shadow-xl shadow-[var(--active-color)]/5">
            {currentSetting.icon}
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--active-color)] rounded-full animate-pulse border-4 border-slate-50 dark:border-[#0a0a0a]" />
        </div>

        {/* Dynamic Input Area */}
        <div className="w-full space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
            {currentSetting.settings}
          </label>
          
          <div className="relative border-2 border-slate-200 dark:border-white/10 focus-within:border-[var(--active-color)] rounded-2xl p-4 bg-white dark:bg-white/5 transition-all">
            {currentSetting.dataType === 'textarea' ? (
              <textarea 
                className="w-full bg-transparent outline-none resize-none text-lg"
                rows="3"
                placeholder={`Tell us about your ${currentSetting.settings}...`}
                value={profileForm}
                onChange={(e) => handleEditChange(e, e.target.value, currentSetting.settings, currentSetting.textlength)}
              />
            ) : (
              <input 
                type={currentSetting.dataType}
                className="w-full bg-transparent outline-none text-lg"
                placeholder={currentSetting.text}
                value={profileForm}
                onChange={(e) => handleEditChange(e, e.target.value, currentSetting.settings, currentSetting.textlength)}
              />
            )}

            {/* Icon Inside Input */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {currentSetting.icon}
            </span>
          </div>

          {/* Character Counter Bar */}
          <div className={`flex justify-between items-center px-1 ${currentSetting.hidden}`}>
            <div className="h-1 flex-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mr-4">
              <div 
                className="h-full bg-[var(--active-color)] transition-all duration-300"
                style={{ width: `${Math.min((profileForm.length / currentSetting.textlength) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              {profileForm.length} / {currentSetting.textlength}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => saveChanges(currentSetting.settings)}
          disabled={isLoading}
          className="group relative w-full h-14 bg-[var(--active-color)] text-white rounded-2xl font-bold text-lg overflow-hidden transition-all active:scale-95 disabled:opacity-70"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <>Save Changes <FaCheckCircle className="text-sm opacity-50" /></>
            )}
          </span>
        </button>

      </div>
    </div>
  );
}

export default Userprofilesetting;
