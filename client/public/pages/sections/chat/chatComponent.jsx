import React from 'react'
import { motion, AnimatePresence } from 'framer-motion' // Using the Framer Motion we've been using
import ChatHistory from './components/chatHistory'
import ChatHeader from './components/chatHeader'
import DarkImage from '../../../../src/assets/dark-chat-bg.jpg'
import LightImage from '../../../../src/assets/light-chat-bg.jpg'
import useMode from '../profile/context/mode'

const ChatComponent = () => {
  const mode = useMode((state) => state.mode)

  return (
    <div className={`h-screen w-full relative overflow-hidden transition-colors duration-500 ${mode === 'dark' ? 'bg-[#0b141a]' : 'bg-[#f0f2f5]'}`}>
      
      {/* Framer Motion Wrapper for Backgrounds */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode} // Key ensures Framer knows when to swap
          initial={{ opacity: 0 }}
          animate={{ opacity: mode === 'dark' ? 0.15 : 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            backgroundImage: `url(${mode === 'dark' ? DarkImage : LightImage})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '400px',
            position: 'absolute',
            inset: 0,
            zIndex: 0
          }}
        />
      </AnimatePresence>

      {/* Content Layer */}
      <div className='relative z-10 flex flex-col h-full'>
        <ChatHeader />
        <div className="flex-1 overflow-y-auto">
          <ChatHistory />
        </div>
      </div>
    </div>
  )
}

export default ChatComponent
