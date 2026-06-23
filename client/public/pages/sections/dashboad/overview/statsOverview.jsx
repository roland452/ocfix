import { BsStarFill } from "react-icons/bs"; 
import { BiChevronRight, BiChevronLeft } from "react-icons/bi"; 
import { FaStar } from "react-icons/fa"
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

// userType prop: 'developer' or 'poster'
const StatsOverview = ({ userType }) => {
  const scrollRef = useRef(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/dashboard-stats', { withCredentials: true });
        setStatsData(res.data);
      } catch (error) {
        console.log(error, 'stat.....');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Developer stats
  const developerStats = [
    { 
      id: 1, 
      title: "Total Offers", 
      value: statsData?.developer?.totalOffers ?? '—', 
      sub: "Proposals sent" 
    },
    { 
      id: 2, 
      title: "Avg Rating", 
      value: statsData?.developer?.avgRating 
        ? `${statsData.developer.avgRating } ` 
        : '—', 
      sub: "From all reviews" 
    },
    { 
      id: 3, 
      title: "Monthly Earned", 
      value: statsData?.developer?.monthlyEarnings 
        ? `₦${statsData.developer.monthlyEarnings.toLocaleString()}` 
        : '₦0', 
      sub: "This month" 
    },
    { 
      id: 4, 
      title: "Total Earned", 
      value: statsData?.developer?.totalEarnings 
        ? `₦${statsData.developer.totalEarnings.toLocaleString()}` 
        : '₦0', 
      sub: "All time earnings" 
    },
  ];

  // Poster stats
  const posterStats = [
    { 
      id: 1, 
      title: "Jobs Posted", 
      value: statsData?.poster?.jobsPosted ?? '—', 
      sub: "Total jobs created" 
    },
    { 
      id: 2, 
      title: "Active Contracts", 
      value: statsData?.poster?.activeContracts ?? '—', 
      sub: "Currently in escrow" 
    },
    { 
      id: 3, 
      title: "Monthly Spent", 
      value: statsData?.poster?.monthlySpent 
        ? `₦${statsData.poster.monthlySpent.toLocaleString()}` 
        : '₦0', 
      sub: "This month" 
    },
    { 
      id: 4, 
      title: "Total Spent", 
      value: statsData?.poster?.totalSpent 
        ? `₦${statsData.poster.totalSpent.toLocaleString()}` 
        : '₦0', 
      sub: "All time spending" 
    },
  ];

  // Pick stats based on userType prop
  const stats = userType === 'freelancer' ? posterStats : developerStats;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full group">

      {/* Scroll Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between z-10 px-2 pointer-events-none">
        <button 
          onClick={() => scroll('left')}
          className="p-2 rounded-full bg-[var(--active-color)] shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <BiChevronLeft size={20} className="text-main" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-[var(--active-color)] shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <BiChevronRight size={20} className="text-main" />
        </button>
      </div>

      {/* Main Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x snap-mandatory scroll-smooth md:p-[1rem]"
      >
        {stats.map((item) => (
          <div 
            key={item.id}
            className="min-w-[65%] md:min-w-0 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-emerald-900/20 shadow-sm snap-center md:min-w-[30%]"
          >
            <h3 className="text-gray-500 text-sm font-medium mb-2">{item.title}</h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-[var(--active-color)] mb-1">
              {loading ? (
                <div className="h-8 w-20 bg-white/10 rounded-lg animate-pulse" />
              ) : (
                <span className="flex items-center gap-1"> {item.value} {item.title === "Avg Rating" && ( <FaStar className="text-[20px] text-amber-400"/> ) }</span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium">{item.sub}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StatsOverview;