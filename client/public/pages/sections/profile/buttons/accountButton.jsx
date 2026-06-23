import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';

const AccountButton = () => {
  const accountButton = [
    { icon: <FiLogOut />, text: 'Switch Account', color: 'hover:bg-secondary/20 hover:text-[var(--active-color)]' },
    { icon: <FaTrashAlt />, text: 'Delete Account', color: 'hover:bg-red-500/10 hover:text-red-500' },
  ];

  return (
    <div className='flex flex-col gap-2 pb-10 px-4'>
        {accountButton.map((button, i) => (
          <button
            key={i}                  
            className={`
              flex items-center gap-4 p-4 rounded-xl transition-all duration-300
              text-slate-600 dark:text-slate-300 font-medium
              bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5

              ${button.color} hover:border-current
            `}
            onClick={() => console.log(button.text)}
          >
            <span className='text-lg'>{button.icon}</span>
            <span className='text-sm'>{button.text}</span>
          </button>
        ))}
    </div>
  );
};

export default AccountButton;
