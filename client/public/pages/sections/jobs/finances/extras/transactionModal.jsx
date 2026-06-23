import { TbDownload, TbShare } from "react-icons/tb"; 
import React, { useRef } from 'react'; // Added useRef
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimes, FaTimesCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TransactionModal = ({ activeHistory, setActiveHistory }) => {
  const receiptRef = useRef(null); // Reference for the PDF capture
  const divStyle = 'py-4 border-b border-dashed border-zinc-200 dark:border-white/10 flex justify-between items-center';

  // --- FUNCTIONALITIES ---

  const downloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) return;

    try {
      // Capture the element as a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        backgroundColor: '#121212', // Matches your dark theme
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Octfix_Receipt_${activeHistory._id || 'transaction'}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Octfix Transaction Receipt',
          text: `Transaction of ₦${activeHistory.amount.toLocaleString()} was ${activeHistory.status}.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`Octfix Receipt: ₦${activeHistory.amount.toLocaleString()} - ${activeHistory.status}`);
      alert("Receipt details copied to clipboard!");
    }
  };

  // -----------------------

  return (
    <AnimatePresence>
      {activeHistory && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveHistory(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* THIS IS THE PART WE CAPTURE FOR PDF */}
            <div ref={receiptRef}>
                <div className="p-8 text-center bg-zinc-50 dark:bg-white/5 border-b dark:border-white/5">
                    <button 
                        onClick={() => setActiveHistory(null)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400"
                    >
                        <FaTimes size={12} />
                    </button>

                    <div className="flex justify-center mb-4">
                        {activeHistory.status === 'success' ? (
                            <div className="p-4 bg-green-500/10 rounded-full">
                                <FaCheckCircle className="text-green-500" size={40} />
                            </div>
                        ) 
                        : (
                            <div className="p-4 bg-red-500/10 rounded-full">
                                <FaTimesCircle className="text-red-500" size={40} />
                            </div>
                        )}
                    </div>
                    
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Transaction Receipt</h2>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white">
                        {activeHistory.type === 'withdrawal' ? '-' : '+'}₦{activeHistory.amount.toLocaleString()}
                    </p>
                </div>

                <div className="px-8 py-6 space-y-1">
                    <div className={divStyle}> 
                        <span className='text-[10px] font-black uppercase tracking-widest text-zinc-400'>From</span>  
                        <span className="text-sm font-bold dark:text-zinc-200"> Roland Aminu </span> 
                    </div>
                    <div className={divStyle}> 
                        <span className='text-[10px] font-black uppercase tracking-widest text-zinc-400'>To</span>  
                        <span className="text-sm font-bold dark:text-zinc-200"> {activeHistory?.receiverId?.name || 'Octfix Wallet'} </span> 
                    </div>
                    <div className={divStyle}> 
                        <span className='text-[10px] font-black uppercase tracking-widest text-zinc-400'>Job Desc</span>  
                        <span className="text-sm font-bold dark:text-zinc-200"> {activeHistory?.jobOfferId?.description || 'Octfix Wallet'} </span> 
                    </div>
                    <div className={divStyle}> 
                        <span className='text-[10px] font-black uppercase tracking-widest text-zinc-400'>Ref</span>  
                        <span className="text-sm font-bold dark:text-zinc-200"> {activeHistory?.reference || 'Octfix Wallet'} </span> 
                    </div>
                    <div className={divStyle}> 
                        <span className='text-[10px] font-black uppercase tracking-widest text-zinc-400'>Date</span>  
                        <span className="text-sm font-bold dark:text-zinc-200"> {new Date(activeHistory.createdAt).toLocaleString()} </span> 
                    </div>
                    <div className={divStyle}> 
                        <span className='text-[10px] font-black uppercase tracking-widest text-zinc-400'>Status</span>  
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${activeHistory.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {activeHistory.status}
                        </span> 
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS (Outside the PDF ref so they don't appear in the PDF) */}
            <div className='p-8 pt-0 flex gap-3 justify-center items-center'>
                <button 
                  onClick={downloadPDF}
                  className="flex-1 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                > 
                    <TbDownload size={18}/> Save PDF
                </button>
                <button 
                  onClick={handleShare}
                  className="w-14 h-14 border border-zinc-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                > 
                    <TbShare size={20}/> 
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// npm install jspdf html2canvas --legacy-peer-deps

export default TransactionModal;
