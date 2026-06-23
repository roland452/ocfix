import React from 'react'
import { HiPaperAirplane } from "react-icons/hi";

const SendButton = ({ handleSend }) => {
  return (
    <button onClick={() => handleSend()} className="bg-[var(--active-color)] text-white p-3 rounded-full">
        <HiPaperAirplane />
    </button>
  )
}

export default SendButton
