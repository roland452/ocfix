import React from 'react'
import { useState } from 'react'
import HistoryContent from './historyContent'
import ApprovalContent from './approvalContent'
import SwitchButton from './components/switchButton'
import { motion } from 'framer-motion';


const Content = () => {
  const [ appointmentSection ,setAppointmentSection ] = useState(true)
  return (
    <motion.div 
      className='relative'
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
    >
      
      <ApprovalContent  appointmentSection={appointmentSection} />
      <HistoryContent  appointmentSection={appointmentSection} />
      
      <SwitchButton appointmentSection={appointmentSection} setAppointmentSection={setAppointmentSection}/>
    </motion.div>
  )
}

export default Content
