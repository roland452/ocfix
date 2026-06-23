import React from 'react'
import { FaHeart, FaRegHeart, FaRegBookmark, FaPaperPlane, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiX } from "react-icons/hi";
import { FiAlertCircle } from 'react-icons/fi';

const JobList = ({ job, fetchClientDetails, getRelativeTime, userIdNumber, setDetails, saveJob,  postReaction, setJobDetailModal }) => {
  return (
     <div key={job._id} className="rounded-3xl border border-gray-100 dark:border-gray-900 bg-[var(--l-bg)] dark:bg-[var(--d-bg)] flex flex-col h-full overflow-hidden hover:shadow-md transition-all">
                
                {/* Header: User + Price */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-[var(--active-color)] capitalize flex items-center justify-center font-bold text-[var(--active-color)] bg-main">
                      {job.postedBy.image ? <img src={job.postedBy.image} className="rounded-full" /> : job.postedBy.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm dark:text-white cursor-pointer" onClick={() => fetchClientDetails(job.postedBy._id)}>{job.postedBy.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-500 uppercase">{getRelativeTime(job.createdAt)}</p>
                        <span className="text-[9px] bg-yellow-500/10 text-yellow-600 px-1 rounded font-black">
                          {job.postedBy.avgRating && (
                              <span className="text-[9px] bg-yellow-500/10 text-yellow-600 px-1 rounded font-black">
                                  ★ {job.postedBy.avgRating}
                              </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[var(--active-color)]">₦{job.price?.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{job.priceType}</p>
                  </div>
                </div>
    
                {/* Content */}
                <div className="px-5 flex-1 cursor-pointer"  onClick={() => setJobDetailModal(job)}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{job.category || 'General'}</p>
                  <h2 className="text-lg font-bold dark:text-white mb-2 leading-tight">{job.description}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{job.about}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-bold text-[var(--active-color)] bg-green-50 dark:bg-gray-800/50 px-2 py-1 rounded-md">#{tag}</span>
                    ))}
                  </div>
                </div>
    
                {/* Actions */}
                <div className="px-5 pb-2">
                  <button 
                    disabled={job.postedBy._id === userIdNumber}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[var(--active-color)] text-white ${job.postedBy._id === userIdNumber ? 'opacity-40' : 'bg-[var(--active-color)] text-white'}`}
                    onClick={() => setDetails(job._id, job.postedBy._id)}
                  >
                    <FaPaperPlane size={14} /> {job.offersSent?.includes(userIdNumber) ? 'Unsend Notice' : 'Send Notice'}
                  </button>
                </div>
    
                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                  <button className="flex items-center gap-2 text-gray-500 text-sm font-semibold" onClick={() => postReaction(job._id)}>
                    {job.liked?.includes(userIdNumber) ? <FaHeart className="text-red-500" /> : <FaRegHeart />} {job.liked?.length || ''} Like
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 text-sm font-semibold" onClick={() => saveJob(job._id)}>
                    <FaRegBookmark /> Save
                  </button>
                </div>
              </div>
  )
}

export default JobList
