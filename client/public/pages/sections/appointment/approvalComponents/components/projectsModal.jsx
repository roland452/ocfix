import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExternalLinkAlt, FaTimes, FaRegImages, FaSearchPlus } from 'react-icons/fa';

const ProjectsModal = ({ link, projects, isProjectModal, setIsProjectModal, sentBy, jobId, sendApproval }) => {
  const [selectedImg, setSelectedImg] = useState(null);

  if (!isProjectModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center md:p-4">
        {/* Main Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsProjectModal(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Body */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[var(--l-bg)] dark:bg-[var(--d-bg)] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-main flex items-center justify-center border border-[var(--active-color)]">
                <FaRegImages className="text-xl text-[var(--active-color)]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[var(--active-color)]">Work Portfolio</h3>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Project Assets</p>
              </div>
            </div>
            <button 
              onClick={() => setIsProjectModal(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-all"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] scrollbar-hide">
            {/* Portfolio Link */}
            {link && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Live Link</label>
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group"
                >
                  <span className="text-[var(--active-color)] text-sm font-medium truncate pr-4">{link}</span>
                  <FaExternalLinkAlt className="text-sm text-[var(--active-color)] group-hover:text-[var(--active-color)]" />
                </a>
              </div>
            )}

            {/* Images Grid */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Gallery</label>
              <div className="grid grid-cols-2 gap-3">
                {projects?.map((img, i) => (
                  <motion.div 
                    key={i}
                    layoutId={`img-${i}`}
                    onClick={() => setSelectedImg(img)}
                    whileHover={{ scale: 1.02 }}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-400 dark:border-white/10 bg-white/5 group cursor-zoom-in"
                  >
                    <img src={img} alt="Project" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FaSearchPlus className="text-white text-xl" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-2 bg-white/[0.02] border-t border-slate-200 dark:border-white/10">
            <button 
              onClick={() => sendApproval(sentBy, jobId,)}
              className="w-full py-4 bg-[var(--active-color)]/10 text-[var(--active-color)] font-bold rounded-3xl hover:bg-[var(--active-color)]/30 transition-all active:scale-95"
            >
              Approve
            </button> 
            <button 
              onClick={() => setIsProjectModal(false)}
              className="w-full py-4 bg-red-100 text-[red] font-bold rounded-3xl hover:bg-red-200 transition-all active:scale-95"
            >
              Decline
            </button>
          </div>
        </motion.div>

        {/* --- LIGHTBOX (Covers the entire screen/modal) --- */}
        <AnimatePresence>
          {selectedImg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 md:p-12 cursor-zoom-out"
              onClick={() => setSelectedImg(null)}
            >
              <motion.button 
                className="absolute top-8 right-8 text-white/50 hover:text-white text-3xl"
                onClick={() => setSelectedImg(null)}
              >
                <FaTimes />
              </motion.button>
              
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                src={selectedImg}
                className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
                alt="Enlarged project"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default ProjectsModal;
