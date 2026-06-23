import React, { useState, useEffect, useRef } from "react";
import { BiPaperclip } from "react-icons/bi"; 
import { AiFillInfoCircle } from "react-icons/ai"; 
import { FaCalendarDay, FaFolder, FaLink, FaUserAlt, FaPhoneAlt, FaChevronRight } from "react-icons/fa"; 
import axios from 'axios';

import useTheme from "../theme/theme";
import useThemeIndex from "../theme/set-theme";
import useProfile from "../../../../context/profile";
import useRefresh from "../../../../context/refresh";
import useToast from "../../../../context/toast";

import Userprofilesetting from "./userprofilesetting";
import ProfileImage from "../component/profile_image";

const Userprofile = () => {
  const [openFile, setOpenFile] = useState(true);
  const fileInputRef = useRef(null);
  const [inputIndex, setInputIndex] = useState(null);
  const [profileForm, setProfileForm] = useState('');

  const setToast = useToast((state) => state.setToast);
  const setRefresh = useRefresh((state) => state.setRefresh);
  const refresh = useRefresh((state) => state.refresh);
  const profile = useProfile((state) => state.profile);
  const colorTheme = useTheme((state) => state.colorTheme);
  const themeIndex = useThemeIndex((state) => state.index);
  const setIndex = useThemeIndex((state) => state.setIndex);

  const userProfile = profile.data;
  const userName = userProfile?.name || 'Unset';

  // File Upload Logic
  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return setToast('No image selected');
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await axios.patch("/api/update-cv", data);
      setToast(res.data.message);
      setRefresh(!refresh);
    } catch (error) {
      setToast(error.message);
    }
  }

  useEffect(() => {
    if (!openFile) {
      fileInputRef.current.click();
      setOpenFile(true);
    }
  }, [openFile]);

  const profileSettings = [
    { icon: <FaUserAlt />, settings: 'name', text: userName, dataType: 'text', textlength: 26, hidden: false },
    { icon: <FaCalendarDay />, settings: 'birthdate', text: userProfile?.birthdate ? new Date(userProfile.birthdate).toLocaleDateString() : 'Unset', dataType: 'date', textlength: 26, hidden: 'hidden' },
    { icon: <FaPhoneAlt />, settings: 'phone', text: userProfile?.phone || 'Unset', dataType: 'number', textlength: 12, hidden: '' },
    { icon: <FaLink />, settings: 'link', text: userProfile?.link || 'Unset', dataType: 'text', textlength: 70, hidden: '' },
    { icon: <AiFillInfoCircle />, settings: 'about', text: 'About Me', dataType: 'textarea', textlength: 55, hidden: '' },
  ];

  function removeInput() {
    setInputIndex(null);
    setProfileForm('');
  }

  function handleEditChange(e, value, type, textlength) {
    if (value.length <= textlength) {
      setProfileForm(value);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-1 py-3 md:p-6 h-full overflow-scroll [&::-webkit-scrollbar]:hidden">
      <div className='flex flex-col gap-10 relative'>
        
        {/* Profile Header Section */}
        <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-sm">
          <ProfileImage 
            openFile={openFile} 
            setOpenFile={setOpenFile} 
            fileInputRef={fileInputRef} 
            handleChange={handleChange} 
          />
        </div>

        {/* Theme Selection Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 px-2">Appearance</h2>
          <div className="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-white/5 p-4 rounded-2xl w-fit">
            {colorTheme.map((theme, i) => (
              <button 
                key={i} 
                className={`w-10 h-10 rounded-full border-4 transition-all duration-300 hover:scale-110 active:scale-90
                  ${i === themeIndex ? 'scale-125 shadow-lg' : 'opacity-60 hover:opacity-100'}
                `}
                style={{ background: theme.bg, borderColor: i === themeIndex ? theme.color : 'transparent' }}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </section>

        {/* Settings List Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 px-2">Account Details</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {profileSettings.map((setting, i) => (
              <button 
                key={i}
                onClick={() => setInputIndex(i)}
                className="group flex items-center gap-5 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-[var(--active-color)] hover:shadow-md transition-all text-left"
              >
                <div className="text-xl p-3 rounded-xl bg-[var(--active-color)]/10 text-[var(--active-color)] group-hover:scale-110 transition-transform">
                  {setting.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-400 capitalize">{setting.settings}</div>
                  <div className="text-slate-900 dark:text-white font-medium">{setting.text}</div>
                </div>
                <FaChevronRight className="text-slate-300 group-hover:text-[var(--active-color)] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </section>

        {/* Slide-over Panel */}
        <Userprofilesetting 
          profileForm={profileForm}
          profileSettings={profileSettings}
          inputIndex={inputIndex}
          handleEditChange={handleEditChange}
          removeInput={removeInput}
        />
        
        {/* Floating Attachment Button */}
        <button 
          className="fixed right-8 bottom-15 w-14 h-14 rounded-2xl bg-[var(--active-color)] text-white shadow-xl shadow-[var(--active-color)]/30 flex items-center justify-center text-xl hover:scale-110 hover:-rotate-6 transition-all active:scale-95 group"
          onClick={() => setOpenFile(false)}
        > 
          <FaFolder className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />   
          <input
            className='hidden'
            type='file'
            accept='image/*'
            ref={fileInputRef}
            onChange={handleChange}
          />
        </button>
      </div>
    </div>
  );
};

export default Userprofile;
