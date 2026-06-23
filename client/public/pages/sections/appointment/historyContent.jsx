import React from 'react'
import { useState } from 'react'
import PostHistory from './components/postHistory'


const HistoryContent = ({ appointmentSection }) => {

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`p-2 md:p-6 h-[90vh] overflow-scroll [&::-webkit-scrollbar]:hidden ${!appointmentSection? 'translate-x-[0%]' : 'translate-y-[-200%]'} transition-all duration-[.25s] ease-in-out`} >
      <PostHistory />
    </div>
  )
}

export default HistoryContent
