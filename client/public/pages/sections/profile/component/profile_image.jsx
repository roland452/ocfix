import { FaSpinner, FaSync, FaUserAlt } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from "react-icons/ai"; 
import { BsFillCameraFill } from 'react-icons/bs';
import React from 'react';
import useError from '../../../../context/error';
import useLoading from '../../../../context/loading';
import useProfile from '../../../../context/profile';
import useRefresh from '../../../../context/refresh';

const ProfileImage = ({ setViewProfile, viewProfile, openFile, fileInputRef, setOpenFile, handleChange }) => {
  const error = useError((state) => state.error);
  const loading = useLoading((state) => state.loading);
  const setRefresh = useRefresh((state) => state.setRefresh);
  const refresh = useRefresh((state) => state.refresh);
  const profile = useProfile((state) => state.profile);

  const userProfile = profile?.data;
  const userName = userProfile?.name || '';
  const userEmail = userProfile?.email || '';

  
  return (
    <div className='flex items-center gap-4 group'>
      {/* Avatar Container */}
      <div className='relative'>
        <div 
          onClick={() => setViewProfile?.(!viewProfile)}
          className={`
            relative w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer
            bg-slate-100 dark:bg-white/5 border-2 border-[var(--active-color)]/30
            transition-all duration-500 ease-out
            group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-3
            group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] group-hover:border-[var(--active-color)]
          `}
        >
          {/* Internal Content (Image or Icon) */}
          <div className="overflow-hidden rounded-xl w-full h-full flex items-center justify-center">
            {loading && (<AiOutlineLoading3Quarters className='animate-spin text-xl text-[var(--active-color)]'/>)}
            {error && (<FaSync className="cursor-pointer" onClick={() => setRefresh(!refresh)} />)}
            { userProfile?.image && (
              <img 
                className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' 
                src={userProfile.image} 
                alt={userEmail[0]?.toUpperCase()} 
              />
             )}
            {!userProfile?.image && (
              <div className='text-2xl font-bold text-[var(--active-color)] uppercase'>
                {userName ? userName[0] : <FaUserAlt />}
              </div>
            )}
          </div>

          {/* Pop-out Camera Badge */}
          {setOpenFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenFile(false);
              }}
              className={`
                absolute -bottom-2 -right-2 w-8 h-8 rounded-full
                bg-[var(--active-color)] text-white text-sm
                flex items-center justify-center border-4 border-white dark:border-[#0f172a]
                shadow-lg transition-all duration-300 delay-75
                group-hover:scale-125 group-hover:-translate-x-1 group-hover:-translate-y-1
              `}
            >
              <BsFillCameraFill />
              <input
                className='hidden'
                type='file'
                accept='image/*'
                hidden={openFile}
                ref={fileInputRef}
                onChange={handleChange}
              />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className='flex flex-col'>
        <div className='font-bold text-slate-900 dark:text-white text-lg tracking-tight truncate max-w-[150px] capitalize'>
          {userName || 'Guest User'}
        </div>
        <div className='text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]'>
          {userEmail}
        </div>
      </div>
    </div>
  );
};

export default ProfileImage;
