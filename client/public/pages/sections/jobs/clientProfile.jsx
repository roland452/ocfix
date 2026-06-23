import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiTrash } from "react-icons/hi";
import { FaPhone, FaEnvelope, FaStar, FaRegStar } from 'react-icons/fa';
import axios from 'axios';
import useProfile from '../../../context/profile'; // To identify current user

const ClientProfile = ({ selectedClient, setSelectedClient }) => {
  const profile = useProfile((state) => state.profile);
  const userIdNumber = profile?.data?.userId || profile?.data?._id || '';

  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedClient?._id) fetchReviews();
  }, [selectedClient]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/user/reviews/${selectedClient._id}`, { withCredentials: true });
      setReviews(res.data.data);
    } catch (err) {
      console.error("Fetch failed");
    }
  };

  const submitReview = async () => {
    if (userRating === 0 || !comment) return;
    setIsSubmitting(true);
    try {
      await axios.post('/api/user/review', {
        revieweeId: selectedClient._id,
        rating: userRating,
        comment
      }, { withCredentials: true });
      setComment("");
      setUserRating(0);
      fetchReviews();
    } catch (err) {
      console.error("Post failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await axios.delete(`/api/user/review/${reviewId}`, { withCredentials: true });
      fetchReviews();
    } catch (err) {
      console.error("Delete failed");
    }
  };

  return (
    <AnimatePresence>
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-[#1a1c1e] w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative h-28 bg-[var(--active-color)] flex items-end justify-center flex-shrink-0">
               <button onClick={() => setSelectedClient(null)} className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white"><HiX /></button>
               <div className="translate-y-10">
                 <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1a1c1e] bg-zinc-200 overflow-hidden shadow-lg">
                   {selectedClient.image ? <img src={selectedClient.image} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-2xl font-black">{selectedClient.name[0]}</span>}
                 </div>
               </div>
            </div>

            <div className="pt-12 pb-6 px-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black dark:text-white leading-tight">{selectedClient.name}</h2>
                <p className="text-[var(--active-color)] font-bold text-[10px] uppercase tracking-widest">Verified Client</p>
              </div>

              {/* Review Input Box */}
              <div className="bg-gray-50 dark:bg-zinc-800/30 p-4 rounded-3xl mb-6 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setUserRating(star)}>
                      {star <= userRating ? <FaStar className="text-yellow-500" /> : <FaRegStar className="text-gray-300" />}
                    </button>
                  ))}
                </div>
                <textarea 
                  className="w-full bg-white dark:bg-zinc-800 rounded-2xl p-3 text-sm outline-none resize-none dark:text-white border border-gray-100 dark:border-gray-700"
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="2"
                />
                <button 
                  onClick={submitReview}
                  disabled={isSubmitting || userRating === 0}
                  className="w-full mt-2 py-3 bg-[var(--active-color)] text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-md active:scale-95 transition-all"
                >
                  {isSubmitting ? 'Processing...' : 'Submit Feedback'}
                </button>
              </div>

              {/* Review Feed */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Reviews ({reviews.length})</p>
                {reviews.map((rev) => (
                  <div key={rev._id} className="bg-white dark:bg-transparent border-b border-gray-100 dark:border-gray-800 pb-3 group">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-xs font-bold dark:text-white block">{rev.reviewerId.name}</span>
                        <div className="flex text-yellow-500 text-[10px]">
                          {[...Array(rev.rating)].map((_, i) => <FaStar key={i} />)}
                        </div>
                      </div>
                      
                      {rev.reviewerId._id === userIdNumber && (
                        <button onClick={() => deleteReview(rev._id)} className="text-gray-300 hover:text-red-500 p-1">
                          <HiTrash size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ClientProfile;
