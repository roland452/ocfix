import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { motion } from 'framer-motion';
import useToast from '../../../context/toast';
import useProfile from '../../../context/profile'
import ClientProfile from './clientProfile'
import NoticeModal from './noticeModal';
import JobList from './components/jobList';
import JobModal from './components/jobModal';
import JobLoader from './components/jobLoader';

const JobBoard = ({ refresh, setRefresh }) => {
  const profile = useProfile((state) => state.profile)
  const setToast = useToast((state) => state.setToast)

  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  async function fetchClientDetails(clientId) {
    setIsModalLoading(true);
    try {
      const res = await axios.get(`/api/user/details/${clientId}`, { withCredentials: true });
      setSelectedClient(res.data.data);
    } catch (error) {
      setToast("Could not load client details");
    } finally {
      setIsModalLoading(false);
    }
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [jobOffers, setJobOffers] = useState([]);
  const [jobDetailModal, setJobDetailModal] = useState(null);
  const [jobOfferId, setJobOfferId] = useState('');
  const [postedBy, setPostedBy] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const onUploadModalClose = () => setIsUploadModalOpen(false);

  function setDetails(jobOfferId, postedBy) {
    setJobOfferId(jobOfferId);
    setPostedBy(postedBy);
    setIsUploadModalOpen(true);
  }

  async function fetchJobOffers() {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/joboffer?page=${page}&limit=6`, { withCredentials: true });
      setJobOffers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setError(false);
    } catch (error) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchJobOffers(); }, [page]);

  // FIX: optimistic save — no full reload
  async function saveJob(jobOfferId) {
    setToast('Saving...');
    try {
      await axios.post('/api/joboffer/save', { jobOfferId }, { withCredentials: true });
      setToast('Job saved!');
    } catch (error) {
      setToast('Failed to save');
    }
  }

  // FIX: optimistic reaction — update state directly, no refresh
  async function postReaction(jobOfferId) {
    const userId = profile?.data?.userId || profile?.data?._id;

    // Update UI immediately
    setJobOffers(prev => prev.map(job => {
      if (job._id !== jobOfferId) return job;
      const alreadyLiked = job.liked?.includes(userId);
      return {
        ...job,
        liked: alreadyLiked
          ? job.liked.filter(id => id !== userId)
          : [...(job.liked || []), userId]
      };
    }));

    try {
      await axios.patch('/api/joboffer/reaction', { jobOfferId }, { withCredentials: true });
    } catch (error) {
      // Revert on fail
      setJobOffers(prev => prev.map(job => {
        if (job._id !== jobOfferId) return job;
        const wasLiked = job.liked?.includes(userId);
        return {
          ...job,
          liked: wasLiked
            ? job.liked.filter(id => id !== userId)
            : [...(job.liked || []), userId]
        };
      }));
      setToast('Failed to react');
    }
  }

  const getRelativeTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day" : " days");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "hrs";
    return "just now";
  };

  const filteredJobs = jobOffers.filter(job =>
    job.about?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userIdNumber = profile?.data?.userId || profile?.data?._id || '';

  return (
    <div className="p-2 md:p-4 h-[90vh] overflow-scroll [&::-webkit-scrollbar]:hidden">
      {/* Header & Search */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        {!isSearchExpanded && (
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-extrabold dark:text-white">
            Jobs
          </motion.h1>
        )}
        <div className={`flex items-center bg-white dark:bg-black rounded-full border border-gray-200 dark:border-gray-500 transition-all ${isSearchExpanded ? 'w-full max-w-md px-4' : 'w-12 h-12 justify-center'}`}>
          <FaSearch className="text-gray-400 cursor-pointer" onClick={() => setIsSearchExpanded(!isSearchExpanded)} />
          {isSearchExpanded && (
            <input
              autoFocus
              className="w-full bg-transparent outline-none py-3 px-3 text-sm dark:text-white"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <JobLoader />
        ) : error ? (
          <div className="fixed top-[50%] left-[50%] translate-[-50%]">
            <div className="flex flex-col items-center justify-center h-64 mt-20 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <FiAlertCircle size={30} />
              </div>
              <h3 className="font-bold text-slate-800">Connection Failed</h3>
              <p className="text-xs text-slate-400 mb-6">We couldn't reach the servers.</p>
              <button
                className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl"
                onClick={fetchJobOffers}
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobList
              key={job._id}
              job={job}
              fetchClientDetails={fetchClientDetails}
              getRelativeTime={getRelativeTime}
              userIdNumber={userIdNumber}
              setDetails={setDetails}
              saveJob={saveJob}
              postReaction={postReaction}
              jobDetailModal={jobDetailModal}
              setJobDetailModal={setJobDetailModal}
            />
          ))
        )}
      </div>

      {/* Job Detail Modal */}
      {jobDetailModal && (
        <JobModal
          jobDetailModal={jobDetailModal}
          setJobDetailModal={setJobDetailModal}
        />
      )}

      {/* Client Profile Modal */}
      <ClientProfile
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
      />

      {/* Notice Modal */}
      <NoticeModal
        jobOfferId={jobOfferId}
        postedBy={postedBy}
        isUploadModalOpen={isUploadModalOpen}
        onUploadModalClose={onUploadModalClose}
      />

      {/* Pagination */}
      {!isLoading && !error && (
        <div className="flex justify-center items-center gap-8 mt-12 pb-10">
          <button
            disabled={page === 1}
            onClick={() => { setPage(page - 1); window.scrollTo(0, 0); }}
            className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border disabled:opacity-20 text-[var(--active-color)]"
          >
            <FaChevronLeft />
          </button>
          <span className="text-xs font-black text-gray-400 uppercase">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }}
            className="p-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black disabled:opacity-20"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default JobBoard;