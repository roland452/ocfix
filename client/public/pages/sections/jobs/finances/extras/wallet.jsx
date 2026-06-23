import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaHistory, FaSync, FaSyncAlt, FaChartLine, FaBusinessTime } from 'react-icons/fa';
import { MdAccountBalanceWallet, MdOutlineAddCircle } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from "react-icons/ai";  

const WalletSection = ({loadingBal, balance, balError, refreshBal, setRefreshBal, transactions = [], setBankSection }) => {
  console.log(balance);
  
  return (
    <div className="p-2 md:p-8 space-y-8 bg-white dark:bg-[var(--d-bg)] h-[90vh] text-zinc-900 dark:text-white transition-colors duration-300 overflow-scroll scrollbar-hide">
      
      {/* 1. Dynamic Balance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-main to-secondary shadow-xl shadow-main/20 text-white"
      >
        <div className="relative z-10">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Total Balance</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight my-4">
          { loadingBal? (
            <AiOutlineLoading3Quarters className='animate-spin font-light cursor-pointer' size={15} />
           ) : 
           balError? (
            <div className='rounded-xl flex gap-4 w-[fit-content]'>
              <button><FaSyncAlt size={20} onClick={() => setRefreshBal(!refreshBal)}/></button>
              <p className='text-[14px] font-light text-zinc-400'>please check your internet connection and try again...</p>
            </div>
            
           ) : `₦${balance.toLocaleString()}`
          }
          </h1>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setBankSection('deposit')}
              className="flex-1 py-4 bg-white text-[var(--active-color)] rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
              <MdOutlineAddCircle className="text-xl" /> Deposit
            </button>
            <button 
              onClick={() => setBankSection('withdrawal')}
              className="flex-1 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-white/20 transition-all active:scale-95">
              <FaArrowUp className="text-sm" /> Withdraw
            </button>
          </div>
        </div>
        {/* Abstract background shape */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
        {[
          { label: 'Transfer', icon: <FaExchangeAlt />, color: 'text-[var(--active-color)]' },
          { label: 'History', icon: <FaHistory />, color: 'text-[var(--active-color)]' },
          { label: 'Stats', icon: <FaChartLine />, color: 'text-[var(--active-color)]' },
        ].map((action, i) => (
          <div key={i} className="p-4 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-3xl flex flex-col items-center gap-2 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all cursor-pointer">
            <div className={`w-10 h-10 rounded-xl bg-main/10 dark:bg-main/20  flex items-center justify-center ${action.color}`}>
              {action.icon}
            </div>
            <span className="text-xs uppercase tracking-tighter opacity-70">{action.label}</span>
          </div>
        ))}
      </div>

      {/* 3. Transaction History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black tracking-tight">Recent Activity</h2>
          <button className="text-[var(--active-color)] font-bold text-xs uppercase tracking-widest hover:underline" onClick={() => setBankSection('history')}>See More</button>
        </div>

        <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-[2rem] divide-y divide-zinc-200 dark:divide-white/5">
          {transactions.length > 0 ? (
            transactions.map((trx, i) => (
              <div 
                key={trx.id || i}
                className="p-5 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                    trx.type === 'deposit' || trx.type === 'milestone_release' ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                    :  'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {trx.type === 'deposit' && <FaArrowUp /> }
                    {trx.type === 'withdrawal' && <FaArrowDown />}
                    {trx.type === 'milestone_release' && <FaBusinessTime /> }
                  </div>
                  <div className='grid grid-cols-1 gap-2'>
                    <h4 className="font-bold text-[12px] md:text-sm leading-tight">{trx.type}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{new Date(trx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${trx.type === 'deposit' || trx.type === 'milestone_release' ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {trx.type === 'deposit' && '+'}
                    {trx.type === 'withdrawal' && '-'}
                    {trx.type === 'milestone_release' && '+'}
                    ₦{trx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] opacity-50 font-medium italic capitalize">{trx.status || 'Success'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 flex flex-col items-center justify-center opacity-20">
              <MdAccountBalanceWallet className="text-7xl mb-3" />
              <p className="font-bold uppercase tracking-widest text-xs">Wallet is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletSection;
