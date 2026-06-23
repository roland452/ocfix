
import React, { useState, useEffect } from 'react';
import { BiMessageSquareDetail } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Modal from './components/modal';
import Reviews from './components/reviews';
import axios from 'axios';
import useToast from '../../../../context/toast';
import useAuth from '../../../../context/auth';

const ReviewFeedback = () => {
  const setToast = useToast((state) => state.setToast);
  const user = useAuth((state) => state.user);

  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchReviews(1, true);
  }, []);

  const fetchReviews = async (pageNum, isFirst = false) => {
    isFirst ? setLoading(true) : setLoadingMore(true);
    try {
      const res = await axios.get(`/api/feedback?page=${pageNum}`, { withCredentials: true });
      if (isFirst) {
        setReviews(res.data.data);
        setRatingBreakdown(res.data.ratingBreakdown);
      } else {
        setReviews(prev => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setToast('Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return setToast('Please select a rating');
    if (!comment.trim()) return setToast('Please write a comment');
    setSubmitting(true);
    try {
      const res = await axios.post('/api/feedback', { rating, comment }, { withCredentials: true });
      setReviews(prev => [res.data.data, ...prev]);
      setComment('');
      setRating(0);
      setShowModal(false);
      setToast('Review submitted! Thank you 🎉');
      // Refresh breakdown
      fetchReviews(1, true);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await axios.patch(`/api/feedback/${id}/like`, {}, { withCredentials: true });
      setReviews(prev => prev.map(r =>
        r._id === id
          ? { ...r, likes: res.data.liked
              ? [...(r.likes || []), user?._id]
              : (r.likes || []).filter(l => l !== user?._id),
            likeCount: res.data.likeCount }
          : r
      ));
    } catch (err) {
      setToast('Failed to like review');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 h-full overflow-scroll [&::-webkit-scrollbar]:hidden py-12">

      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-4">
        <div className="fixed top-5 left-1">
          <h2 className="text-xl font-bold dark:text-white">User Reviews</h2>
          <p className="text-xs text-slate-500 font-medium">Hear from our community</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="fixed top-5 right-1 flex items-center gap-2 px-5 py-2.5 bg-[var(--active-color)] text-white rounded-2xl font-bold text-xs shadow-lg shadow-[var(--active-color)]/20 active:scale-95 transition-all"
        >
          <BiMessageSquareDetail size={16} /> Leave Feedback
        </button>
      </div>

      {/* Rating Breakdown */}
      {ratingBreakdown && !loading && (
        <div className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-5xl font-black text-[var(--active-color)]">{ratingBreakdown.avg}</p>
              <div className="flex justify-center text-[var(--active-color)] mt-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(ratingBreakdown.avg) ? 'opacity-100' : 'opacity-20'}>★</span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">{ratingBreakdown.total} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {ratingBreakdown.breakdown.map(({ star, count }) => {
                const pct = ratingBreakdown.total > 0 ? Math.round((count / ratingBreakdown.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold w-3">{star}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--active-color)] rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {loading ? (
        <div className="flex justify-center py-10">
          <AiOutlineLoading3Quarters className="animate-spin text-[var(--active-color)]" size={28} />
        </div>
      ) : (
        <>
          <Reviews reviews={reviews} onLike={handleLike} currentUserId={user?._id} />

          {hasMore && (
            <button
              onClick={() => fetchReviews(page + 1)}
              disabled={loadingMore}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-xs uppercase tracking-widest text-[var(--active-color)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loadingMore ? (
                <><AiOutlineLoading3Quarters className="animate-spin" size={14} /> Loading...</>
              ) : 'Load More Reviews'}
            </button>
          )}

          {!hasMore && reviews.length > 0 && (
            <p className="text-center text-xs opacity-30 font-bold">You've seen all reviews</p>
          )}

          {reviews.length === 0 && (
            <p className="text-center text-xs opacity-30 font-bold py-10">No reviews yet — be the first!</p>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          setShowModal={setShowModal}
          setHover={setHover}
          setRating={setRating}
          hover={hover}
          rating={rating}
          comment={comment}
          setComment={setComment}
          handleSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default ReviewFeedback;



