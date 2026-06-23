import React, { useEffect, useState } from 'react';
import { MdLeaderboard } from 'react-icons/md';
import { FaMedal } from 'react-icons/fa';
import axios from 'axios'

const TopEarners = () => {
  const [earners, setEarners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopEarners = async () => {
      try {
        const res = await axios.get('/api/dashboard/top-earners');
        setEarners(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopEarners();
  }, []);

  const getMedalColor = (index) => {
    switch (index) {
      case 0: return 'text-yellow-400';   // gold
      case 1: return 'text-gray-400';     // silver
      case 2: return 'text-amber-600';    // bronze
      default: return 'text-slate-500';
    }
  };

  const getRankBg = (index) => {
    switch (index) {
      case 0: return 'bg-yellow-400/10 border border-yellow-400/20';
      case 1: return 'bg-gray-400/10 border border-gray-400/20';
      case 2: return 'bg-amber-600/10 border border-amber-600/20';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="my-6 p-6 rounded-2xl dark:bg-white/5 shadow-2xl shadow-[#9c9898] dark:shadow-[transparent] dark:border-1 dark:border-emerald-900/20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <MdLeaderboard className="text-[var(--active-color)] text-xl" />
          <div>
            <h3 className="font-bold text-lg">Top Earners</h3>
            <p className="text-xs text-gray-400">This week's highest paid freelancers</p>
          </div>
        </div>
        <div className="bg-emerald-500/10 px-2 py-1 rounded-full">
          <span className="text-green-500 text-xs font-bold">LIVE</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : earners.length === 0 ? (
        <div className="text-center py-10 opacity-30 font-bold text-xs uppercase tracking-widest">
          No earnings this week yet
        </div>
      ) : (
        <div className="space-y-3">
          {earners.map((earner, index) => (
            <div
              key={earner._id}
              className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${getRankBg(index)}`}
            >
              {/* Rank medal */}
              <div className="w-8 flex items-center justify-center">
                {index < 3 ? (
                  <FaMedal className={`text-xl ${getMedalColor(index)}`} />
                ) : (
                  <span className="text-xs font-black text-gray-500">#{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center font-bold text-[var(--active-color)] flex-shrink-0 capitalize">
                {!earner.image
                  ? earner.name?.[0]
                  : <img src={earner.image} alt="" className="w-full h-full object-cover" />
                }
              </div>

              {/* Name and job */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm capitalize truncate">{earner.name}</p>
                <p className="text-xs opacity-50 truncate">{earner.jobTitle}</p>
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className={`font-black text-sm ${index === 0 ? 'text-yellow-400' : 'text-[var(--active-color)]'}`}>
                  ₦{earner.totalEarned.toLocaleString()}
                </p>
                <p className="text-[10px] opacity-40">{earner.jobCount} job{earner.jobCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopEarners;



