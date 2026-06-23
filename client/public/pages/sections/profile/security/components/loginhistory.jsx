import React from 'react';
import { AiOutlineLoading3Quarters } from "react-icons/ai"; 
import { FiAlertCircle } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { MdHistory, MdCheckCircle, MdError, MdShield } from "react-icons/md";
import { HiOutlineDeviceMobile, HiOutlineDesktopComputer } from "react-icons/hi";
import useToast from '../../../../../context/toast';



const LoginHistory = () => {

  const setToast = useToast((state) => state.setToast)

  // Dummy Data representing the "loginHistory" array in your Schema
 
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const getRelativeTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
    return "just now";
  };
  console.log(sessions, 'sessions.......');
  

   useEffect(() => {
      
      const fetchSessions = async () => {
        setLoading(true)
        try {
          const res = await axios.get('/api/login-history', { withCredentials: true });
          setLoading(false);
          setSessions(res.data);
          
        } catch (err) {
          setToast("Could not load devices");
          setLoading(false);
          setError(true)
        } 
      };
      fetchSessions();
    }, [refresh]);





  return (
    <div className="p-6 h-full flex flex-col gap-0 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-black dark:text-white">Login Activity</h1>
        <p className="text-gray-500 text-sm">Recent attempts to access your Octfix account.</p>
      </div>

     
      
     
      {/* History List */}
      <div className="flex flex-col gap-3 overflow-scroll mt-6 [&::-webkit-scrollbar]:hidden">
      
      {
        // loading animation 
        loading ? (
          <div className="flex flex-col items-center justify-center h-64 mt-20">
            <AiOutlineLoading3Quarters className="animate-spin text-[var(--active-color)] mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Getting Login History...</p>
          </div>
        ) :
       
        // error boundary content
        error? ( 
          <div className="flex flex-col items-center justify-center h-64 mt-20 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <FiAlertCircle size={30} />
              </div>
              <h3 className="font-bold text-slate-800">Connection Failed</h3>
              <p className="text-xs text-slate-400 mb-6">We couldn't reach the servers.</p>
              <button className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl" onClick={() => setRefresh(!refresh)}>Retry Connection</button>
          </div>
        ) :

        // empty list contemt
        sessions.length === 0 ? (
            <div>
              empty
            </div>
        ) :
        sessions.map((log) => (
          <div 
            key={log._id} 
            className="group flex flex-col gap-3 p-5 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/6 dark:border-white/5 transition-all hover:bg-black/10 dark:hover:bg-white/10"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                {/* Device Icon */}
                <div className="w-12 h-12 rounded-2xl bg-black/10 dark:bg-black/40 flex items-center justify-center text-2xl text-gray-400 group-hover:text-[var(--active-color)] transition-colors">
                  {log.os == 'Android' ? <HiOutlineDeviceMobile /> : <HiOutlineDesktopComputer />}
                </div>
                
                <div>
                  <h3 className="font-bold text-sm text-black dark:text-white">{log.os} • {log.deviceName}</h3>
                  <p className="text-[11px] text-gray-500 font-medium">{log.browser} • {log.ipAddress}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                log.status === 'failed' ? 'bg-red-500/10 text-red-500' : 
                'bg-amber-500/10 text-amber-500'
              }`}>
                {log.status === 'success' && <MdCheckCircle />}
                {log.status === 'failed' && <MdError />}
                {log.status === '2fa_pending' && <MdShield />}
                {log.status.replace('_', ' ')}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-3">
              <span className="text-[10px] text-gray-400 font-medium italic">{log.location}</span>
              <span className="text-[10px] text-gray-400 font-bold">{getRelativeTime(log.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 mt-4">
        <MdHistory className="text-xl text-blue-500 shrink-0" />
        <p className="text-[10px] text-gray-500 leading-tight">
          Login history is stored for 30 days. If you see any activity from a location or device you don't recognize, change your password immediately.
        </p>
      </div>
    </div>
  );
};

export default LoginHistory;
