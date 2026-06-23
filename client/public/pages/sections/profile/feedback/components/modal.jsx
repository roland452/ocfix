import React from 'react'
import { AiFillStar, AiOutlineStar, AiOutlineSend } from "react-icons/ai";
import { BiX } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const Modal = ({ setShowModal, setHover, setRating, hover, rating, comment, setComment, handleSubmit, submitting }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold dark:text-white">Drop a Review</h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 text-slate-400 hover:bg-white/10 rounded-full transition-all"
          >
            <BiX size={28} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Your Rating</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={index}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(starValue)}
                    className="text-4xl transition-all duration-200 hover:scale-125 active:scale-90"
                  >
                    {starValue <= (hover || rating)
                      ? <AiFillStar className="text-[var(--active-color)]" />
                      : <AiOutlineStar className="text-slate-300 dark:text-white/10" />
                    }
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <p className="text-xs font-bold text-[var(--active-color)]">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
              </p>
            )}
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Your Thoughts</label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you think about Octfix?"
              className="w-full p-5 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-3xl outline-none focus:border-[var(--active-color)] transition-all dark:text-white text-sm resize-none"
            />
            <p className="text-[10px] text-right opacity-40">{comment.length}/300</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0 || !comment.trim()}
            className={`w-full h-14 bg-[var(--active-color)] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-[var(--active-color)]/20 ${
              submitting || rating === 0 || !comment.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:brightness-110 active:scale-95'
            }`}
          >
            {submitting ? (
              <><AiOutlineLoading3Quarters className="animate-spin" size={18} /> Submitting...</>
            ) : (
              <>Submit Review <AiOutlineSend /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;