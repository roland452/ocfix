import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaImage, FaLink, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from "react-icons/hi"; 
import axios from 'axios';

const NoticeModal = ({jobOfferId, postedBy, isUploadModalOpen, onUploadModalClose }) => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState("");

  async function sendOffer() {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('jobOfferId', jobOfferId);
    formData.append('postedBy', postedBy);
    formData.append('portfolioLink', portfolioLink);
    
    

    try {
      await axios.post('/api/sendoffer', formData, { 
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsSubmitting(false);
      onUploadModalClose();
    } catch (error) { 
      console.log(error, 'from /api/sendoffer'); 
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!isUploadModalOpen) {
      setPortfolioLink("");
  
    }
  }, [isUploadModalOpen]);




  if (!isUploadModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800"
      >
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-bold dark:text-white leading-tight">Notice Details</h2>
          <button onClick={onUploadModalClose} className="text-gray-400 hover:text-gray-600 transition-colors"><FaTimes /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <FaLink className="text-[var(--active-color)]" /> Portfolio Link (Optional)
            </label>
            <input 
              type="url" 
              placeholder="https://..." 
              className="w-full bg-gray-50 dark:bg-zinc-800 rounded-2xl py-4 px-4 text-sm outline-none border border-transparent focus:border-[var(--active-color)] transition-all dark:text-white" 
              value={portfolioLink} 
              onChange={(e) => setPortfolioLink(e.target.value)} 
            />
          </div>

          <button 
            disabled={isSubmitting}
            onClick={sendOffer}
            className="w-full py-4 bg-[var(--active-color)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Confirm & Send Notice'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NoticeModal;
