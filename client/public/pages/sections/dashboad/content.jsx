import { AiOutlineUserSwitch } from "react-icons/ai"; 
import React from 'react'
import { useState } from 'react'
import StatsOverview from './overview/statsOverview'
import TopEarners from './overview/topEarners'
import AppointmentTrends from './overview/appointmentTrends'
import AutoActivityFlipper from './overview/autoActivityFlipper'
import ReviewsChart from './overview/reviewsChart'
import TopPayJobs from './overview/topPayJobs'
import Footer from './footer'



const Content = () => {
  const [userType, setUserType] = useState('client')
  return (
    <div 
      className={`w-full h-[99vh] pb-[10rem] overflow-scroll overflow-hidden [&::-webkit-scrollbar]:hidden`}
    >
        <div onClick={() => setUserType(userType === 'freelancer'? 'client' : 'freelancer')} className='py-3 px-2 sm:pl-4 flex items-end gap-2.5 '>
          <div className="capitalize cursor-pointer text-2xl">"{userType}" mode </div>
          <button className='cursor-pointer text-xl'>
            <AiOutlineUserSwitch />
          </button>
        </div>
        <StatsOverview userType={userType} />
        <h1 className="pl-[1rem] font-bold sm:text-lg">Activities Dashboard</h1>
        <AutoActivityFlipper />
                
        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-[.2rem_2rem] items-start p-[.5rem]'>

            <div>
              <AppointmentTrends  userType={userType} />
              <p className="text-xs text-gray-400 py-4">Activity for the last 7 days</p>
              <ReviewsChart />
            </div>

            <div>
              <TopEarners />
              <TopPayJobs />
            </div>
        </div>
        <Footer />
    </div>
  )
}

export default Content
