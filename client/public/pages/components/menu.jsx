import React from 'react'
import { BsFillXCircleFill } from "react-icons/bs"; 
import NavButton from './navButton';
import useNavActive from '../../context/navContext';
import ModeButton from './mode_button';


const Menu = () => {

  

  const isActiveNav = useNavActive((state) => state.isActiveNav)
  const setIsActive = useNavActive((state) => state.setIsActive);
  

  return (
    <div 
      className={`
        bg-[var(--d-bg)] md:dark:bg-main/20
        grid grid-rows-[10%_70%_1fr] gap-[0rem] fixed top-0 sm:top-1 bottom-0 sm:bottom-5 md:left-1 w-[300px] sm:rounded-2xl
        rounded-b-0 rounded-tr-2xl rounded-br-2xl
        sm:border-2 border-white/10 
        ${isActiveNav? 'left-0' : 'left-[-300px]'} md:relative z-100
        transition-[.5s] ease-in-out duration-[.5s]
        ] 
      `}
      >

      {/* Mobile Close Button */}
      <button 
        className="md:hidden absolute left-2 top-2 text-white/50 hover:text-[var(--active-color)] transition-colors"
        onClick={() => setIsActive(false)}
      >
        <BsFillXCircleFill size={24} />
      </button>


      <header className='flex place-content-center pt-[1rem] pl-[1rem] '>
        <h1 className='text-[30px] text-white md:text-4xl font-bold'>octfix</h1>
      </header>

      <NavButton />

      <ModeButton />

    </div>
  )
}

export default Menu
