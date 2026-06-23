import React from 'react'
import SetupButton from '../buttons/setupButton'
import AdvanceSetupButtons from '../buttons/advanceSetupButtons'
import AccountButton from '../buttons/accountButton'
import { motion } from 'framer-motion';



const Content = () => {

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      className='h-[80vh] grid grid-col pb-[5rem] overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden'>
        <div className='grid grid-cols-1 md:grid-cols-2 items-start gap-[.5rem_.5rem]'>
            <SetupButton />
            <AdvanceSetupButtons />
        </div>
        <h1 className='text-[25px] p-[1rem] text-black dark:text-white'>Account</h1>
        <AccountButton />
    </motion.div>
  )
}

export default Content 