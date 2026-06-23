import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiTrash } from "react-icons/hi";
import { FaPhone, FaEnvelope, FaStar, FaRegStar } from 'react-icons/fa';
import axios from 'axios';
import useProfile from '../../../../../context/profile';

const ClientProfileModal = ({ clientId, isModalOpen, onClose }) => {
  const [clientData, setClientData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const profile = useProfile((state) => state.profile);
  const currentUserId = profile?.data?.userId || '';

  // Fetch client details and reviews when modal opens or clientId changes
  useEffect(() => {
    if (isModalOpen && clientId) {
      fetchClientData();
      fetchReviews();
    }
  }, [isModalOpen, clientId]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      // Assuming you have a route to get specific user profile data
      const res = await axios.get(`/api/user/profile/${clientId}`, { withCredentials: true });
      setClientData(res.data.data);
    } catch (err) {
      console.error("Error fetching client profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/user/reviews/${clientId}`, { withCredentials: true });
      setReviews(res.data.data);
    } catch (err) {
      console.error("Error fetching reviews", err);
    }
  };

  const handleReviewSubmit = async () => {
    if (userRating === 0 || !comment) return;
    try {
      // Backend handles "one review only" via findOneAndUpdate(upsert: true)
      await axios.post('/api/user/review', {
        revieweeId: clientId,
        rating: userRating,
        comment
      }, { withCredentials: true });
      setComment("");
      setUserRating(0);
      fetchReviews();
    } catch (err) {
      console.error("Review submission failed", err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`/api/user/review/${reviewId}`, { withCredentials: true });
      fetchReviews();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#1a1c1e] w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
          >
            {/* Header Section */}
            <div className="relative h-28 bg-[var(--active-color)] flex items-end justify-center flex-shrink-0">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors">
                <HiX size={20} />
              </button>
              <div className="translate-y-10">
                <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#1a1c1e] bg-zinc-200 overflow-hidden shadow-lg">
                  {clientData?.image ? (
                    <img src={clientData.image} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-gray-400">
                      {clientData?.name?.[0] || "?"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="pt-12 pb-6 px-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-black/50 dark:text-white leading-tight">{clientData?.name || "Loading..."}</h2>
                <p className="text-[var(--active-color)] font-bold text-[10px] uppercase tracking-widest">Verified Client</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <FaEnvelope className="text-gray-400" />
                  <p className="text-sm font-bold text-black/50 dark:text-gray-200">{clientData?.email}</p>
                </div>
                {clientData?.phone && (
                  <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <FaPhone className="text-gray-400" />
                    <p className="text-sm font-bold dark:text-gray-200">{clientData.phone}</p>
                  </div>
                )}
              </div>

              {/* Review Input Box */}
              <div className="bg-gray-50 dark:bg-zinc-800/30 p-4 rounded-3xl mb-6 border border-gray-200 dark:border-gray-800">
                <div className="flex justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setUserRating(star)}>
                      {star <= userRating ? <FaStar className="text-yellow-500" /> : <FaRegStar className="text-gray-300" />}
                    </button>
                  ))}
                </div>
                <textarea 
                  className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 text-sm outline-none resize-none text-black dark:text-white"
                  placeholder="Review this client..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="2"
                />
                <button 
                  onClick={handleReviewSubmit}
                  className="w-full mt-2 py-3 bg-[var(--active-color)] text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95"
                >
                  Post Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Feedback ({reviews.length})</p>
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold dark:text-white block">{rev.reviewerId?.name}</span>
                        <div className="flex text-yellow-500 text-[10px]">
                          {[...Array(rev.rating)].map((_, i) => <FaStar key={i} />)}
                        </div>
                      </div>
                      {rev.reviewerId?._id === currentUserId && (
                        <button onClick={() => handleDeleteReview(rev._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <HiTrash size={16} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{rev.comment}</p>
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

export default ClientProfileModal;
