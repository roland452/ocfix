import { AiOutlinePaperClip } from "react-icons/ai"; 
import React from 'react';

/**
 * @param {Function} onClick - Function passed from ChatInput to trigger 
 * the hidden file input's click event.
 */
const FileButtton = ({ onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className="text-xl cursor-pointer p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-all flex items-center justify-center text-zinc-600 dark:text-zinc-400"
      title="Attach file"
    >
      <AiOutlinePaperClip />
    </div>
  )
}

export default FileButtton;
