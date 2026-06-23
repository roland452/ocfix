import React from 'react'
import useSection from '../../../context/sectionState'
import Header from './component/header';
import ContentPopup from './component/content-popup';
import Content from './component/content';




const Profile = () => {

  const activeSection = useSection((state) => state.activeSection)

  return (
    <div 
      className={`
        absolute w-[100%] h-[100vh] 
        ${activeSection === 'profile'? 'translate-x-[0%]' : 'translate-x-[100%]'} transition-all duration-[.5s] ease-in-out
        overflow-hidden [&::-webkit-scrollbar]:hidden
      `}>
        <div className='p-[0rem_.2rem]'>
          <ContentPopup />             
          <Header />
          <Content />      
        </div>
        
    </div>
  )
}

export default Profile
