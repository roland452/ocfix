import { MdOutlineRemove } from "react-icons/md"; 
import { RxBorderSolid } from "react-icons/rx"; 
import React from 'react'
import useSettingPopup from '../context/setting-popup-context'
import Feedback from '../feedback/feedback'
import Feed from '../feedback/feed';
import Avatars from '../avatar/avatars';
import Security from '../security/security'
import Notices from '../notice/notices'
import Fonts from '../theme/fonts';
import Info from '../info/info';
import Userprofile from '../userprofile/userprofile';
const ContentPopup = () => {

 const section = useSettingPopup((state) => state.section)
 const setSection = useSettingPopup((state) => state.setSection)

 
 

  return (
    <div className={`
        absolute t-0 w-full right-0 h-full bg-[var(--l-bg)] dark:bg-[var(--d-bg)] text-black dark:text-white
        transition-all duration-[.5s] ease px-2 py-4 pb-15 md:p-[2rem] z-20 ${section === ''? 'translate-y-[100%]' : 'translate-y-[0%]'}
    `}>
        <div className='absolute left-[50%] translate-[-50%] top-2 cursor-pointer text-[25px] h-2 w-30 rounded-xl bg-black/19 dark:bg-white/19' onClick={() => setSection('')}>  </div>
        {
          section === 'security'? <Security /> :
          section === 'avatars'? <Avatars /> :
          section === 'review and feedback'? <Feed /> :
          section === 'notices'? <Notices /> :
          section === 'info'? <Info /> :
          section === 'profile'? <Userprofile /> :
          section === 'font style'? <Fonts /> : ''
        }
    </div>
  )
}

export default ContentPopup
