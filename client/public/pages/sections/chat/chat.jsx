import React from 'react'
import Content from './content'
import useSection from '../../../context/sectionState'

const Chat = () => {
  const activeSection = useSection((state) => state.activeSection)
  return (
    <div className={`absolute w-[100%] h-[99vh]  ${activeSection === 'chat'? 'translate-x-[0%]' : 'translate-x-[100%]'} transition-all duration-[.5s] ease-in-out`}>
      <Content />
    </div>
  )
}

export default Chat
