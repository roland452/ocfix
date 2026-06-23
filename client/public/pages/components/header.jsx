import { TbBellRingingFilled } from "react-icons/tb"; 
import { FaDollarSign, FaUserCircle } from "react-icons/fa"; 
import { AiOutlineBars } from "react-icons/ai"; 
import React from 'react'
import useNavActive from "../../context/navContext";
import useSection from "../../context/sectionState";
import useChat from "../sections/chat/context/chat";
import { Link } from "react-router-dom"


const Header = () => {
  const setActiveSection = useSection((state) => state.setActiveSection)
  const activeSection = useSection((state) => state.activeSection)
  const setIsActive = useNavActive((state) => state.setIsActive)

  const activeChatId = useChat((state) => state.activeChatId);


  
  
  return (
    <header className="grid grid-cols-1  bg-[var(--l-bg)] dark:bg-[var(--d-bg)] text-[var(--l-t)] dark:text-[var(--d-t)]">
        {/* left header  */}
        {
          activeChatId && activeSection === 'chat' ? '' :
          <div className='grid grid-cols-2 md:grid-cols-1 grid-start p-2'>

            <span className="md:hidden" 
              onClick={() => setIsActive(true)}
            ><AiOutlineBars /></span>

            <div className='flex flex-row-reverse gap-[1rem] items-center'>
                <span 
                  className="text-[23px] cursor-pointer text-[var(--active-color)] w-8 h-8 rounded-3xl bg-green-200 flex place-content-center items-center"
                  onClick={() => setActiveSection('fixprice')}
                > ₦  </span>
                <span className="text-[20px] cursor-pointer" > <Link to={'/'}> <FaUserCircle /> </Link>  </span>
            </div>
          </div>
        }

    </header>
  )
}

export default Header
