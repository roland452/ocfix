import React from 'react'
import ChatComponent from './chatComponent'
import ChatWindow from './components/chatWindow'
import useChat from './context/chat'

const Content = () => {
  const activeChatId = useChat((state) => state.activeChatId);
  
  return (
    <div>
        {
            !activeChatId? <ChatWindow /> : <ChatComponent />
        }
        
    </div>
  )
}

export default Content
