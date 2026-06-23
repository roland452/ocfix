import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaCommentDots } from 'react-icons/fa';
import { MdNotificationsActive, MdHistory, MdWork } from 'react-icons/md';
import { BsStarFill } from 'react-icons/bs';
import axios from 'axios';

const AutoActivityFlipper = () => {
  const [index, setIndex] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get('/api/dashboard/activity-feed');
        setActivities(res.data);
      } catch (err) {
        console.error('Activity feed error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // Auto-flip every 4 seconds
  useEffect(() => {
    if (activities.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activities.length]);

  const getTypeConfig = (type) => {
    switch (type) {
      case 'proposal':
        return { color: 'text-green-500 bg-green-500/10',   icon: <FaCheckCircle size={14} /> };
      case 'hired':
        return { color: 'text-emerald-400 bg-emerald-400/10', icon: <MdWork size={15} /> };
      case 'milestone':
        return { color: 'text-yellow-400 bg-yellow-400/10', icon: <MdNotificationsActive size={16} /> };
      case 'review':
        return { color: 'text-blue-400 bg-blue-400/10',     icon: <BsStarFill size={13} /> };
      case 'message':
        return { color: 'text-purple-400 bg-purple-400/10', icon: <FaCommentDots size={13} /> };
      default:
        return { color: 'text-gray-400 bg-gray-400/10',     icon: <FaCheckCircle size={14} /> };
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const current = activities[index];

  return (
    <div className='p-[1rem_1rem]'>
      <div className="p-4 rounded-2xl dark:bg-white/5 shadow-2xl dark:shadow-[transparent] dark:border-1 dark:border-emerald-900/20 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MdHistory className="text-[var(--accent-green)]" />
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Live Feed</span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1">
            {activities.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === index
                    ? 'w-4 bg-[var(--accent-green)]'
                    : 'w-1 bg-emerald-900/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative h-12">
          {loading ? (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
                <div className="h-2 bg-white/10 rounded animate-pulse w-1/4" />
              </div>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs text-gray-500 uppercase tracking-widest text-center pt-3">
              No recent activity
            </p>
          ) : (
            <div
              key={current.id}
              className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700"
            >
              {/* Icon */}
              <div className={`p-2 rounded-full flex-shrink-0 ${getTypeConfig(current.type).color}`}>
                {getTypeConfig(current.type).icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  <span className="font-bold mr-1 capitalize">{current.user}</span>
                  {current.action}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-medium">
                  {timeAgo(current.time)}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AutoActivityFlipper;




