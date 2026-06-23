import React, { useState, useEffect, useRef } from 'react'
import { FaUserAlt, FaCamera, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import useProfile from '../../../../context/profile.js'
import useToast from '../../../../context/toast.js'
import useRefresh from '../../../../context/refresh.js'
import ProfileImage from './profile_image.jsx'

const Header = () => {
  const setToast = useToast((state) => state.setToast)
  const setRefresh = useRefresh((state) => state.setRefresh)
  const refresh = useRefresh((state) => state.refresh)

  const [openFile, setOpenFile] = useState(true)
  const [viewProfile, setViewProfile] = useState(false)
  const profile = useProfile((state) => state.profile)
  const userProfile = profile.data
  const userName = !userProfile ? '' : userProfile.name
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!openFile) {
      fileInputRef.current.click()
      setOpenFile(true)
    }
  }, [openFile])

  async function handleChange(e) {
    const file = e.target.files[0]
    if (!file) return setToast('No image selected')
    try {
      const data = new FormData()
      data.append("image", file)
      const res = await axios.patch("/api/profile-image", data)
      setToast(res.data.message)
      setRefresh(!refresh)
    } catch (error) {
      setToast(error.message)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-row justify-between items-center w-full pb-8 pt-4 px-2"
    >
      {/* 1. Profile Info & Identity Section */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <ProfileImage 
            setViewProfile={setViewProfile}
            viewProfile={viewProfile}
            openFile={openFile}
            fileInputRef={fileInputRef}
            handleChange={handleChange}
            setOpenFile={setOpenFile}
          />
        </div>
      </div>

      {/* 2. Full-Screen Image Preview Modal */}
      <AnimatePresence>
        {viewProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/5 dark:bg-black/50 backdrop-blur-md"
          >
            {/* Close Overlay */}
            <div className="absolute inset-0" onClick={() => setViewProfile(false)} />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative z-[110] flex flex-col items-center gap-4"
            >
              {userProfile?.image ? (
                <img 
                  className='w-[320px] h-[320px] md:w-[450px] md:h-[450px] object-cover rounded-2xl shadow-2xl border-4 border-white dark:border-zinc-800' 
                  src={'http://localhost:5000' + userProfile.image} 
                  alt="Profile Large" 
                />
              ) : (
                <div className="w-[320px] h-[320px] bg-zinc-700 flex items-center justify-center rounded-2xl">
                   <FaUserAlt className="text-white text-9xl opacity-20" />
                </div>
              )}
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Header
