import React, { useRef } from 'react'
import { HiOutlineTrash, HiCheck, HiX } from "react-icons/hi";
import AudioButton from './buttons/audioButton'
import SendButton from './buttons/sendButton'
import FileButtton from './buttons/fileButtton'
import ProjectButton from './buttons/projectButton' 
import useChat from '../../context/chat'

const ChatInput = ({ 
  text, setText, handleSend, isRecording, 
  startRecording, stopRecording, recordingTime, 
  recordedFile, setRecordedFile, replyingTo, setReplyingTo 
}) => {
  const fileInputRef = useRef(null);
  const activeChat = useChat((state) => state.activeChat);
  const setIsReview = useChat((state) => state.setIsReview); 
  

  return (
    <div className="fixed bottom-0 left-2 right-2 md:left-4 md:right-4 z-50 pb-2">
        <div className="max-w-2xl mx-auto flex flex-col shadow-2xl rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-900 bg-[var(--l-bg)] dark:bg-[var(--d-bg)]">
          
          {/* UPDATED: Reply Preview Section */}
          {replyingTo && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border-l-4 border-[var(--active-color)] flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="min-w-0 text-left px-2">
                <p className="text-[var(--active-color)] text-[10px] font-black uppercase tracking-wider">Replying to</p>
                <p className="text-sm opacity-60 truncate italic font-medium">"{replyingTo.text}"</p>
              </div>
              <button 
                onClick={() => setReplyingTo(null)} 
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <HiX className="opacity-50" size={18} />
              </button>
            </div>
          )}

          <div className="flex gap-1 md:gap-2 items-center p-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => handleSend(e.target.files[0].name, null, e.target.files[0])} 
            />
            
            <div className="flex items-center gap-1 md:gap-2">
              {recordedFile ? (
                <button onClick={() => setRecordedFile(null)} className="p-2 text-zinc-500 hover:text-red-500">
                  <HiOutlineTrash size={22} />
                </button>
              ) : (
                <div className="flex items-center gap-1 md:gap-2">
                   {!isRecording && (
                    <>
                      <FileButtton onClick={() => fileInputRef.current.click()} />
                      {activeChat?.isHired && (
                        <ProjectButton onClick={() => setIsReview(true)} />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            
            <input 
              className="flex-1 p-3 bg-transparent outline-none text-sm"
              placeholder={isRecording ? `Recording... ${recordingTime}` : recordedFile ? "Voice note ready" : "Type a message..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isRecording || recordedFile}
              onKeyDown={(e) => e.key === 'Enter' && !isRecording && handleSend()}
            />
            
            <div className='flex gap-1 md:gap-2 items-center pr-1'>
              {isRecording ? (
                <button onClick={stopRecording} className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform">
                   <div className="w-3 h-3 bg-white rounded-sm" /> 
                </button>
              ) : recordedFile ? (
                <button onClick={() => handleSend()} className="bg-[var(--active-color)] text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform">
                  <HiCheck size={20} />
                </button>
              ) : !text.trim() ? (
                <AudioButton startRecording={startRecording} />
              ) : (
                <SendButton handleSend={handleSend} />
              )}
            </div>
          </div>
        </div>
    </div>
  )
}

export default ChatInput;
