import React from 'react'
import { AiFillStar } from "react-icons/ai";
import { FaQuoteLeft, FaHeart, FaRegHeart } from "react-icons/fa";
import { BiUserCircle } from "react-icons/bi";
import { motion } from 'framer-motion';

const Reviews = ({ reviews, onLike, currentUserId }) => {
  return (
    <div className="grid gap-4">
      {reviews.map((rev) => {
        const isLiked = rev.likes?.includes(currentUserId);
        const likeCount = rev.likeCount ?? rev.likes?.length ?? 0;

        return (
          <motion.div
            key={rev._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] group hover:border-[var(--active-color)]/40 transition-all"
          >
            <FaQuoteLeft className="absolute top-4 right-6 text-slate-100 dark:text-white/5 text-4xl" />

            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex items-center justify-center text-slate-400 flex-shrink-0">
                {rev.userId?.image
                  ? <img src={rev.userId.image} alt="" className="w-full h-full object-cover" />
                  : <BiUserCircle size={24} />
                }
              </div>

              <div>
                <h4 className="text-sm font-bold dark:text-white capitalize">
                  {rev.userId?.name || 'Anonymous'}
                </h4>
                <div className="flex text-[var(--active-color)]">
                  {[...Array(5)].map((_, i) => (
                    <AiFillStar key={i} className={i < rev.rating ? 'opacity-100' : 'opacity-20'} />
                  ))}
                </div>
              </div>

              <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase z-10">
                {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative z-10 mb-4">
              {rev.comment}
            </p>

            {/* Like Button */}
            <button
              onClick={() => onLike(rev._id)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-90 ${
                isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
              }`}
            >
              {isLiked
                ? <FaHeart size={13} className="text-red-500" />
                : <FaRegHeart size={13} />
              }
              <span>{likeCount > 0 ? likeCount : ''} {likeCount === 1 ? 'Like' : likeCount > 1 ? 'Likes' : 'Like'}</span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Reviews;












