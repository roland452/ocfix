import React from 'react';
import { FaUserAlt, FaUserLock } from "react-icons/fa"; 
import { BiLogInCircle } from "react-icons/bi"; 

const AuthButtons = ({authSection, setAuthSection}) => {
  return (
    <div className="flex items-center justify-center gap-6 my-4">
      {[
        { id: 'login', icon: <BiLogInCircle />, color: 'bg-red-400' },
        { id: 'signup', icon: <FaUserAlt />, color: 'bg-blue-500' },
        { id: 'admin', icon: <FaUserLock />, color: 'bg-green-500' }
      ].map((btn) => (
        <button 
          key={btn.id}
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
            authSection === btn.id 
              ? `${btn.color} text-white shadow-lg scale-110` 
              : 'bg-black/5 dark:bg-white/5 text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'
          }`}
          onClick={() => setAuthSection(btn.id)}
        >
          <span className="text-xl">{btn.icon}</span>
        </button>
      ))}
    </div>
  );
};

export default AuthButtons;
