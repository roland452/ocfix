import React from 'react'
import Header from './header'
import Dashboard from '../sections/dashboad/dashboard'
import Jobs from '../sections/jobs/jobs'
import SavedJob from '../sections/jobs/savedjob/savedJob'
import Appointment from '../sections/appointment/appointment'
import Profile from '../sections/profile/profile'
import Chat from '../sections/chat/chat'
import BankOverview from '../sections/jobs/finances/bankoverview'
import useSection from '../../context/sectionState'
import { motion } from 'framer-motion';


const Content = () => {
  const section = useSection((state) => state.activeSection)
  return (
    <div className='bg-[var(--l-bg)] dark:bg-[var(--d-bg)] text-[var(--l-t)] dark:text-[var(--d-t)]'>
        <Header />
        <div className={`w-full relative`}>
            { section === 'dashboard' && ( <Dashboard /> )}
            { section === 'jobs' && ( <Jobs /> )}
            { section === 'saved jobs' && ( <SavedJob /> )}
            { section === 'appointments' && ( <Appointment /> )}
            { section === 'profile' && ( <Profile /> )}
            { section === 'chat' && ( <Chat /> )}
            { section === 'fixprice' && ( <BankOverview /> )}
          
        </div>
    </div>
  )
}

export default Content
