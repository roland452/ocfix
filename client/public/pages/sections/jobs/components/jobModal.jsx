import { BsFillPinAngleFill } from "react-icons/bs";
import React from 'react'
import { motion } from 'framer-motion';
import { FaBriefcase, FaPaperPlane, FaTimes, FaTag } from 'react-icons/fa';
import { BiMoney } from 'react-icons/bi';

const JobModal = ({ jobDetailModal, setJobDetailModal }) => {
  if (!jobDetailModal) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold dark:text-white leading-tight">Job Details</h2>
            <p className="text-xs opacity-40 mt-0.5 capitalize">{jobDetailModal?.category}</p>
          </div>
          {/* FIX: arrow function so it doesn't call immediately */}
          <button
            onClick={() => setJobDetailModal(null)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden flex-1">

          {/* Price & Type */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--active-color)]/10 px-3 py-1.5 rounded-full">
              <BiMoney className="text-[var(--active-color)]" size={14} />
              <span className="text-xs font-black text-[var(--active-color)]">
                ₦{Number(jobDetailModal?.price || 0).toLocaleString()}
              </span>
            </div>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${
              jobDetailModal?.priceType === 'fixed'
                ? 'bg-blue-500/10 text-blue-500'
                : 'bg-purple-500/10 text-purple-500'
            }`}>
              {jobDetailModal?.priceType || 'Fixed'}
            </span>
            <div className="flex items-center gap-1 opacity-40 ml-auto">
              <FaPaperPlane size={10} />
              <span className="text-[10px] font-bold">
                {jobDetailModal?.offersSent?.length || 0} proposals
              </span>
            </div>
          </div>

          {/* About / Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <BsFillPinAngleFill className="text-[var(--active-color)]" /> About
            </label>
            {/* FIX: use real data, scrollable for long text */}
            <p className="text-sm font-medium leading-relaxed dark:text-white">
              {jobDetailModal?.about}
            </p>
          </div>

          {/* Description — full long text */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <FaBriefcase className="text-[var(--active-color)]" size={10} /> Job Description
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {jobDetailModal?.description}
            </p>
          </div>

          {/* Tags */}
          {jobDetailModal?.tags?.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FaTag className="text-[var(--active-color)]" size={10} /> Skills Required
              </label>
              <div className="flex flex-wrap gap-2">
                {jobDetailModal.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold px-3 py-1 bg-[var(--active-color)]/10 text-[var(--active-color)] rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Apply Button */}
        <div className="p-6 pt-0 flex-shrink-0">
          <button
            onClick={() => setJobDetailModal(null)}
            className="w-full py-4 bg-[var(--active-color)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[var(--active-color)]/20 active:scale-95 transition-all"
          >
            Close & Apply
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default JobModal;



