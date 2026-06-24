import React, { useState, useEffect } from 'react';
import { HiOutlineBell, HiOutlineShieldCheck, HiOutlineInformationCircle, HiX } from 'react-icons/hi';
import { BiMoney, BiChat, BiStar } from 'react-icons/bi';
import { FaBriefcase } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useSection from '../../../../context/sectionState';
import useChat from '../../chat/context/chat';
import useNotices from './notice';
import useToast from '../../../../context/toast';

const Notices = () => {
  const setActiveSection = useSection((state) => state.setActiveSection);
  const setActiveId = useChat((state) => state.setActiveChatId);

  const setNotices = useNotices((state) => state.setNotices);
  const notices = useNotices((state) => state.notices);

  const setToast = useToast((state) => state.setToast)

  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try {
      const res = await axios.get('/api/notices', { withCredentials: true });
      setNotices(res.data.data || []);
    } catch (err) {
      console.error(err);
      setToast('internet error could not get updated notice')
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await axios.patch('/api/notices/mark-all-read', {}, { withCredentials: true });
      setNotices(prev => prev.map(n => ({ ...n, status: 'seen' })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const markOneRead = async (id) => {
    try {
      await axios.patch(`/api/notices/${id}/read`, {}, { withCredentials: true });
      setNotices(prev => prev.map(n => n._id === id ? { ...n, status: 'seen' } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNoticeClick = (ntc) => {
    if (ntc.status === 'unread') markOneRead(ntc._id);

    switch (ntc.type) {
      case 'message':
      case 'hired':
        setActiveSection('chat');
        if (ntc.refId) setActiveId(ntc.refId);
        break;
      case 'job':
      case 'proposal':
        setActiveSection('jobs');
        break;
      case 'appointment':
        setActiveSection('appointments');
        break;
      default:
        setModalData(ntc);
        break;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'security': return <HiOutlineShieldCheck className="text-red-400" />;
      case 'info': return <HiOutlineInformationCircle className="text-blue-400" />;
      case 'payment': return <BiMoney className="text-green-400" />;
      case 'message': return <BiChat className="text-purple-400" />;
      case 'review': return <BiStar className="text-yellow-400" />;
      case 'job':
      case 'proposal':
      case 'hired': return <FaBriefcase className="text-orange-400" />;
      default: return <HiOutlineBell className="text-[var(--active-color)]" />;
    }
  };

  const getRelativeTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yday';
    return `${days}d ago`;
  };

  const unreadCount = notices.filter(n => n.status === 'unread').length;

  return (
    <div className="flex flex-col gap-4 h-full md:p-2">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-[var(--active-color)] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={markingAll} className="text-xs text-[var(--active-color)] font-bold hover:underline">
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="relative flex flex-col gap-3 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <AiOutlineLoading3Quarters className="animate-spin text-[var(--active-color)]" size={24} />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <HiOutlineBell size={40} className="mx-auto mb-3" />
            <p className="font-bold text-sm">No notifications yet</p>
          </div>
        ) : (
          notices.map((ntc) => (
            <div
              key={ntc._id}
              onClick={() => handleNoticeClick(ntc)}
              className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border cursor-pointer
                ${ntc.status === 'unread'
                  ? 'bg-white/10 border-[var(--active-color)]/30 shadow-lg'
                  : 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-[var(--active-color)]/50'
                }`}
            >
              <div className="p-3 rounded-xl bg-black/20 text-xl flex-shrink-0">
                {getIcon(ntc.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <h3 className={`font-medium truncate pr-16 ${ntc.status === 'unread' ? '' : 'text-gray-400 text-[15px]'}`}>
                    {ntc.title}
                  </h3>
                  <span className="absolute right-0 top-0 text-[10px] uppercase tracking-wider text-gray-500 whitespace-nowrap">
                    {getRelativeTime(ntc.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{ntc.message}</p>
              </div>
              {ntc.status === 'unread' && (
                <div className="absolute right-4 w-2 h-2 rounded-full bg-[var(--active-color)] animate-pulse shadow-[0_0_10px_var(--active-color)]" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {modalData && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/10 dark:bg-white/10 text-xl">
                    {getIcon(modalData.type)}
                  </div>
                  <h2 className="font-bold text-sm">{modalData.title}</h2>
                </div>
                <button onClick={() => setModalData(null)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                  <HiX />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {modalData.message}
                </p>

                {/* Payment details */}
                {modalData.type === 'payment' && modalData.meta && (
                  <div className="space-y-2 bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                    {modalData.meta.amount && (
                      <div className="flex justify-between">
                        <span className="text-xs opacity-50 font-bold">Amount</span>
                        <span className="text-xs font-black text-green-500">+₦{Number(modalData.meta.amount).toLocaleString()}</span>
                      </div>
                    )}
                    {modalData.meta.jobTitle && (
                      <div className="flex justify-between">
                        <span className="text-xs opacity-50 font-bold">Job</span>
                        <span className="text-xs font-bold">{modalData.meta.jobTitle}</span>
                      </div>
                    )}
                    {modalData.meta.reference && (
                      <div className="flex justify-between">
                        <span className="text-xs opacity-50 font-bold">Ref</span>
                        <span className="text-xs font-bold opacity-70">{modalData.meta.reference}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Review details */}
                {modalData.type === 'review' && modalData.meta && (
                  <div className="space-y-2 bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
                    {modalData.meta.rating && (
                      <div className="flex justify-between">
                        <span className="text-xs opacity-50 font-bold">Rating</span>
                        <span className="text-xs font-black text-yellow-500">
                          {'★'.repeat(modalData.meta.rating)}{'☆'.repeat(5 - modalData.meta.rating)}
                        </span>
                      </div>
                    )}
                    {modalData.meta.comment && (
                      <p className="text-xs text-gray-500 italic">"{modalData.meta.comment}"</p>
                    )}
                    {modalData.meta.reviewerName && (
                      <div className="flex justify-between">
                        <span className="text-xs opacity-50 font-bold">From</span>
                        <span className="text-xs font-bold capitalize">{modalData.meta.reviewerName}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-gray-400 text-right">{getRelativeTime(modalData.createdAt)}</p>

                <button
                  onClick={() => setModalData(null)}
                  className="w-full py-3 bg-[var(--active-color)] text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notices;



