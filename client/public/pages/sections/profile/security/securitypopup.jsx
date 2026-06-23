import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import FaceId from './components/faceid'
import Password from './components/password'
import TwoFactor from './components/twofactor'
import LinkDevice from './components/linkdevice'
import LoginHistory from './components/loginhistory'
import Permission from './components/permission'
import FingerPrint from './components/fingerprint'

const SecurityPopup = ({ section, setSection }) => {
  return (
    <div className={`fixed left-0 right-0 top-0 bottom-0 bg-[var(--l-bg)] dark:bg-[var(--d-bg)] transition-all duration-[.5s] ease-in-out ${section === ''? 'translate-y-[100%]' : 'translate-y-[0%]'}`}>
      <div className='absolute left-[50%] z-50 translate-[-50%] top-2 cursor-pointer text-[25px] h-2 w-30 rounded-xl bg-black/19 dark:bg-white/19' onClick={() => setSection('')}> </div>
      { section === 'face' && ( <FaceId /> ) }   
      { section === 'password' && ( <Password /> ) }   
      { section === '2fa' && ( <TwoFactor /> ) }   
      { section === 'devices' && ( <LinkDevice /> ) }   
      { section === 'sessions' && ( <LoginHistory /> ) }   
      { section === 'permissions' && ( <Permission /> ) }   
      { section === 'fingerprint' && ( <FingerPrint /> ) }   
    </div>
  )
}

export default SecurityPopup
