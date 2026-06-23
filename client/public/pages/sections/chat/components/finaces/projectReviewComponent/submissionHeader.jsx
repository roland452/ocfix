import React from 'react'
import { FiX, FiCheckCircle, FiClock } from 'react-icons/fi';

const SubmissionHeader = ({
    contract,
    onClose,
    timeLeft,
    setActiveMilestoneIndex,
    activeMilestoneIndex,
    setEditMode,
    setSelectedFiles,
}) => {
  return (
    <>
        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/2">
            <div>
                <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter">Contract Progress</h2>
                <div className="flex items-center gap-2 mt-1">
                    <FiClock className="text-blue-500 animate-pulse" size={12}/>
                </div>
            </div>
            <button onClick={onClose} className="p-3 bg-zinc-100 dark:bg-white/5 hover:bg-red-500/10 rounded-full transition-all"><FiX size={20}/></button>
        </div>

        {/* STAGE SELECTOR */}
        <div className="px-8 pt-6 pb-2 flex gap-3 overflow-x-auto scrollbar-hide">
            {contract?.milestones?.map((m, idx) => (
                <button 
                    key={idx}
                    onClick={() => { setActiveMilestoneIndex(idx); setEditMode(null); setSelectedFiles([]); }}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-2 ${activeMilestoneIndex === idx ? 'bg-[var(--active-color)] text-white shadow-lg' : 'bg-zinc-100 dark:bg-white/5 text-zinc-400'}`}
                >
                    {m.status === 'approved' && <FiCheckCircle />}
                    Stage {idx + 1}: {m.title}
                </button>
            ))}
        </div>
    </>
)}

export default SubmissionHeader
