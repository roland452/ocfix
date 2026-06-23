import React, { useState, useEffect } from 'react';
import { FaSearch, FaBookmark, FaBriefcase, FaPaperPlane } from 'react-icons/fa';
import { HiX } from "react-icons/hi";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import EmptyList from '../approvalComponents/components/emptyList';
import Client from '../approvalComponents/components/client';
import Header from '../approvalComponents/components/header';
import Queue from '../approvalComponents/components/queue';
import LoaderAnimation from '../../../../../src/assets/loader';
import ErrorMessage from '../../../../../src/assets/error';

const ApprovalsManager = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(false);
  
  // States for Filtering and Animation
  const [filter, setFilter] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [queueId, setQueueId] = useState('');

  async function fetchOffers() {
    try {
      // Backend route populates jobOfferId (description) and sentBy (excluding password)
      const res = await axios.get('/api/offers', { withCredentials: true });
      setPendingRequests(res.data.data || []);
      setIsLoading(false);
      setError(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setError(true);
    }
  }

  useEffect(() => {
    fetchOffers();
  }, [refresh]);

  // Logic to get unique job titles for filter buttons
  const uniqueJobTitles = [...new Set(pendingRequests.map(req => req.jobOfferId?.description))].filter(Boolean);

  // Combined Filter: Handles both the Category Button and the Search Bar
  const filteredRequests = pendingRequests.filter((req) => {
    const matchesButton = filter === 'All' || req.jobOfferId?.description === filter;
    const matchesSearch = req.jobOfferId?.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.sentBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesButton && matchesSearch;
  });

  const isEmpty = pendingRequests.length === 0;

  return (
    <div className="p-4 lg:p-8 bg-[var(--l-bg)] dark:bg-[var(--d-bg)] min-h-screen text-gray-100">
      <Header isEmpty={isEmpty} pendingRequests={pendingRequests} />

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="flex-1">
          
          {/* Animated Search and Filter Header */}
          {!isEmpty && (
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex items-center justify-between h-12">
                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                  <button 
                    onClick={() => setFilter('All')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === 'All' ? 'bg-[var(--active-color)] text-white' : 'bg-zinc-900 text-gray-400'}`}
                  >
                    All Requests
                  </button>
                  {uniqueJobTitles.map((title) => (
                    <button
                      key={title}
                      onClick={() => setFilter(title)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === title ? 'bg-[var(--active-color)] text-white' : 'bg-zinc-900 text-gray-400'}`}
                    >
                      {title}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-end">
                  <AnimatePresence>
                    {isSearchOpen ? (
                      <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 240, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="relative flex items-center bg-zinc-800 rounded-2xl border border-gray-700 px-3 py-2"
                      >
                        <FaSearch className="text-[var(--active-color)] mr-2" />
                        <input 
                          autoFocus
                          type="text"
                          placeholder="Search..."
                          className="bg-transparent border-none outline-none w-full text-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <HiX className="cursor-pointer text-gray-500" onClick={() => {setIsSearchOpen(false); setSearchTerm("");}} />
                      </motion.div>
                    ) : (
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsSearchOpen(true)}
                        className="p-3 bg-zinc-800 rounded-2xl border border-gray-700 text-gray-400"
                      >
                        <FaSearch />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Scrolling List Area */}
          <div className="h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden space-y-4 pb-24">
            {isLoading ? (
              <LoaderAnimation />
            ) : error ? (
              <div>
                <ErrorMessage /> 
              </div>
            ) : isEmpty ? (
              <EmptyList />
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No applications match your selection.</div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {filteredRequests.map((req) => (
                  <Client key={req._id} req={req} fetchOffers={fetchOffers}/>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Queue Sidebar */}
        {!isEmpty && (
          <div className="lg:w-80">
            <Queue pendingRequests={pendingRequests} setQueueId={setQueueId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsManager;
