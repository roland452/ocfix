import React from 'react'
import ApprovalsManager from './components/approvalManager'

const ApprovalContent = ({ appointmentSection }) => {
  return (
    <div className={`absolute w-[100%] h-[90vh] ${appointmentSection? 'translate-x-0 ' : 'translate-x-[100%]'} transition-all ease-in-out duration-[.5s]`} >
      <ApprovalsManager />
    </div>
  )
}

export default ApprovalContent
