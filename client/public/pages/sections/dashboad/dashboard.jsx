import React from 'react'
import useSection from '../../../context/sectionState'
import Content from './content'


const Dashboard = () => {

  const activeSection = useSection((state) => state.activeSection)

  return (
    <div className={`absolute w-[100%] h-[95vh] pb-[5rem] overflow-hidden ${activeSection === 'dashboard'? 'translate-x-[0%]' : 'translate-x-[100%]'} transition-all duration-[.5s] ease-in-out`}>
      <Content />
    </div>
  )
}

export default Dashboard
