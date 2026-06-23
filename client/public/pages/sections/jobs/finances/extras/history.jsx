import React from 'react'
import { useState } from 'react';
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaHistory, FaBusinessTime } from 'react-icons/fa';
import { MdAccountBalanceWallet, MdOutlineAddCircle } from 'react-icons/md';
import { IoMdArrowBack } from "react-icons/io";
import { motion } from 'framer-motion';
import TransactionModal from './transactionModal';

const History = ({ setBankSection, transactions }) => {
  const [activeHistory, setActiveHistory] = useState(null)

  console.log(activeHistory);
  
  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-2 md:p-4 h-[90vh] relative"
    >

        <button onClick={() => setBankSection('')} className="mb-3 flex items-center gap-2 font-bold opacity-70"><IoMdArrowBack /> Back</button>

        {/* header */}
        <div className="flex items-center justify-between  py-2 md:py-3">
          <h2 className="text-xl font-black tracking-tight">Recent Activity</h2>
        </div>

        {
            activeHistory && (
                <TransactionModal activeHistory={activeHistory} setActiveHistory={setActiveHistory} />
            )
        }



        <div className="pb-6 divide-y space-y-3 divide-zinc-200 dark:divide-white/5 h-[80vh] overflow-scroll scrollbar-hide">
            {transactions.length > 0 ? (
            transactions.map((trx, i) => (
                <div 
                onClick={() => setActiveHistory(trx)}
                key={trx.id || i}
                className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-[var(--active-color)]/50  flex items-center justify-between transition-all"
                >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                    trx.type === 'deposit' || trx.type === 'milestone_release' ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
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
        
    </motion.div>
  )
}

export default History
