import React, { useState, useEffect } from 'react';
import { FaBookmark, FaSearch, FaBriefcase, FaPaperPlane, FaClock, FaTag } from 'react-icons/fa';
import { HiX } from "react-icons/hi";
import { BiMoney } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import LoaderAnimation from '../../../../../src/assets/loader';
import useRefresh from '../context/refresh';
import useToast from '../../../../context/toast.js';
import ErrorMessage from '../../../../../src/assets/error.jsx';

const SavedJobs = () => {
  const refresh = useRefresh((state) => state.refresh);
  const setRefresh = useRefresh((state) => state.setRefresh);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unsavingId, setUnsavingId] = useState(null);
  const setToast = useToast((state) => state.setToast);

  async function fetchSavedJobs() {
    try {
      const res = await axios.get('/api/joboffer/save', { withCredentials: true });
      setSavedJobs(res.data.data || []);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(true);
      setToast('Could not fetch saved jobs');
    }
  }

  useEffect(() => { fetchSavedJobs(); }, [refresh]);

  async function unsaveJob(jobOfferId) {
    setUnsavingId(jobOfferId);
    try {
      await axios.post('/api/joboffer/save', { jobOfferId }, { withCredentials: true });
      // Optimistically remove from list
      setSavedJobs(prev => prev.filter(item => item.jobOfferId?._id !== jobOfferId));
      setToast('Job removed from saved');
    } catch (error) {
      setToast('Failed to unsave');
    } finally {
      setUnsavingId(null);
    }
  }

  const getRelativeTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " min ago" : " mins ago");
    return "just now";
  };

  const filteredSaves = savedJobs.filter(item => {
    const title = item.jobOfferId?.description?.toLowerCase() || "";
    const company = item.jobOfferId?.postedBy?.name?.toLowerCase() || "";
    return title.includes(searchTerm.toLowerCase()) || company.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full h-[95vh] overflow-hidden p-4 md:p-6">
      <div className="max-w-5xl mx-auto h-full flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 h-12 flex-shrink-0">
          <AnimatePresence mode="wait">
            {!isSearchOpen && (
              <motion.div
                key="title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-3xl font-extrabold tracking-tight">Saved</h1>
                <p className="text-xs opacity-40 font-medium">
                  {isLoading? 'getting' : filteredSaves.length} job{filteredSaves.length !== 1 ? 's' : ''} saved
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-end flex-1">
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.div
                  key="search"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative flex items-center bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 px-4 py-2.5 shadow-sm"
                >
                  <FaSearch className="text-[var(--active-color)] mr-3 flex-shrink-0" size={13} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search saved jobs..."
                    className="bg-transparent border-none outline-none w-full text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <HiX
                    className="ml-2 cursor-pointer opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
                    size={18}
                    onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }}
                  />
                </motion.div>
              ) : (
                <motion.button
                  key="icon"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-400 shadow-sm"
                >
                  <FaSearch size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoaderAnimation setRefresh={setRefresh} refresh={refresh} />
        ) : error ? (
          <ErrorMessage />
        ) : (
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-6">

            {/* Empty States */}
            {savedJobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--active-color)]/10 flex items-center justify-center">
                  <FaBookmark className="text-[var(--active-color)]" size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg">No saved jobs yet</p>
                  <p className="text-xs opacity-40 mt-1">Jobs you save will appear here</p>
                </div>
              </motion.div>
            ) : filteredSaves.length === 0 ? (
              <div className="text-center py-16 opacity-40">
                <FaSearch size={28} className="mx-auto mb-3" />
                <p className="font-bold">No matches for "{searchTerm}"</p>
              </div>
            ) : (
              /* Responsive Grid:
                 Mobile: 1 column full card
                 Tablet (md): 2 columns
                 Desktop (lg): 3 columns
              */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSaves.map((item, index) => {
                  const job = item.jobOfferId;
                  const author = job?.postedBy;

                  return (
                    <motion.div
                      layout
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[1.5rem] p-5 flex flex-col gap-4 hover:border-[var(--active-color)]/40 hover:shadow-lg hover:shadow-[var(--active-color)]/5 transition-all duration-300"
                    >
                      {/* Top — Avatar + Name + Unsave */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-11 h-11 bg-[var(--active-color)]/10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-[var(--active-color)]">
                            {author?.image
                              ? <img src={author.image} className="w-full h-full object-cover" alt="" />
                              : author?.name?.[0]?.toUpperCase()
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold opacity-50 capitalize truncate">{author?.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                job?.priceType === 'fixed'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : 'bg-purple-500/10 text-purple-500'
                              }`}>
                                {job?.priceType || 'Fixed'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Unsave Button */}
                        <button
                          onClick={() => unsaveJob(job._id)}
                          disabled={unsavingId === job._id}
                          className="p-2 rounded-xl text-[var(--active-color)] hover:bg-red-500/10 hover:text-red-500 transition-all flex-shrink-0"
                          title="Remove from saved"
                        >
                          <FaBookmark size={14} />
                        </button>
                      </div>

                      {/* Job Title */}
                      <div className="flex-1">
                        <h3 className="font-bold text-sm leading-snug line-clamp-2">
                          {job?.about || job?.description}
                        </h3>

                        {/* Tags */}
                        {job?.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {job.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-[var(--active-color)]/10 text-[var(--active-color)] rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom — Price + Time + Apply */}
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
                        <div className="flex flex-col gap-1">
                          {/* Price */}
                          {job?.price && (
                            <div className="flex items-center gap-1 text-[var(--active-color)]">
                              <BiMoney size={13} />
                              <span className="text-xs font-black">₦{Number(job.price).toLocaleString()}</span>
                            </div>
                          )}
                          {/* Time */}
                          <div className="flex items-center gap-1 opacity-40">
                            <FaClock size={9} />
                            <span className="text-[10px] font-medium">{getRelativeTime(item.createdAt)}</span>
                          </div>
                        </div>

                        {/* Apply Button */}
                        <button
                          className="flex items-center gap-1.5 bg-[var(--active-color)] text-white font-bold py-2 px-4 rounded-xl text-xs transition-all active:scale-95 hover:brightness-110 shadow-sm shadow-[var(--active-color)]/20 flex-shrink-0"
                          onClick={() => {/* hook up your apply logic here */}}
                        >
                          Apply <FaPaperPlane size={10} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;