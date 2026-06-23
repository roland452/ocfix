import { BiBriefcaseAlt2 } from "react-icons/bi"; 
import { MdYoutubeSearchedFor } from "react-icons/md"; 
import { ImUserTie } from "react-icons/im"; 
import { RiFolderChartFill } from "react-icons/ri"; 
import React from 'react'

const SwitchButton = ({ appointmentSection ,setAppointmentSection }) => {
  return (
    <button 
      className='fixed w-[48px] h-[48px] rounded-full bg-[var(--active-color)] shadow-2xl place-items-center text-center text-2xl right-3.5 bottom-[35%]'
      onClick={() => setAppointmentSection(!appointmentSection)}
    > 
      {!appointmentSection? <BiBriefcaseAlt2 />: <MdYoutubeSearchedFor /> }
    </button>
  )
}

export default SwitchButton
