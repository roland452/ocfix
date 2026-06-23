import React from 'react'
import JobBoard from './jobBoard'
import { FaPlus } from 'react-icons/fa'
import { motion } from 'framer-motion';

const Content = ({ setPostPage, refresh, setRefresh }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <JobBoard 
        refresh={refresh} 
        setRefresh={setRefresh} 
      />
      <button 
        onClick={() => setPostPage(true)}
        className='fixed w-[48px] h-[48px] rounded-full bg-main shadow-2xl place-items-center text-[var(--active-color)] text-center text-2xl right-3.5 bottom-[35%]'
      ><FaPlus /> </button>
    </motion.div>
  )
}

export default Content
