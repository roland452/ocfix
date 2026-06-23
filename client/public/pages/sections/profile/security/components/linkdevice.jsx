import { AiFillAndroid } from "react-icons/ai"; 
import { ImAppleinc } from "react-icons/im"; 
import React, { useState, useEffect } from 'react';
import { MdDevices, MdLaptop, MdSmartphone, MdDesktopWindows } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; 
import { FiAlertCircle } from 'react-icons/fi';
import { RiLogoutCircleRLine } from "react-icons/ri";
import axios from 'axios';
import useToast from "../../../../../context/toast";

const LinkDevice = () => {
  const setToast = useToast((state) => state.setToast);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(false);

  console.log(sessions);
  
  

  // Fetch active sessions from your backend 
  useEffect(() => {
   
    const fetchSessions = async () => {
      setLoading(true)
      try {
        const res = await axios.get('/api/auth/sessions', { withCredentials: true });
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

  const revokeSession = async (sessionId) => {
    try {
      await axios.post('/api/auth/logout-device', { sessionId }, { withCredentials: true });
      // Remove from UI immediately
      setSessions(sessions.filter(s => s.sessionId !== sessionId));
      setToast("Device logged out successfully");
      setRefresh(!refresh)
    } catch (err) {
      setToast("Failed to revoke access");
    }
  };


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

  return (
    <div className="p-6 h-full flex flex-col gap-0 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-black dark:text-white">Linked Devices</h1>
        <p className="text-gray-500 text-sm">Manage all browsers and apps currently logged into Octfix.</p>
      </div>
     

      <div className="flex flex-col gap-4 overflow-scroll mt-6 [&::-webkit-scrollbar]:hidden">

        
        {/* loading animation */}
        {loading? (
          <div className="flex flex-col items-center justify-center h-64 mt-20">
              <AiOutlineLoading3Quarters className="animate-spin text-[var(--active-color)] mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Getting Linked Devices...</p>
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
        // session mapped list
        [...sessions].reverse().map((session) => (
          <div key={session.sessionId} className="flex items-center justify-between p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="text-3xl text-[var(--active-color)] p-2 bg-[var(--active-color)]/10 rounded-2xl">
                {/* Logic to choose icon based on device name */}
                {session.deviceName === 'Android'  ? <AiFillAndroid /> : session.deviceName === 'iOS'? <ImAppleinc /> : <MdLaptop />}
              </div>
              <div>
                <h3 className="font-bold text-sm text-black dark:text-white">
                  {session.deviceName} • {session.browser}
                </h3>
                <p className="text-[10px] text-gray-500 uppercase font-medium tracking-tighter">
                  {session.location || 'Unknown Location'} •  Last active: { getRelativeTime(session.lastActive) }
                </p>
              </div>
            </div>

            <button 
              onClick={() => revokeSession(session.sessionId)}
              className="p-3 text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
              title="Log out device"
            >
              <RiLogoutCircleRLine className="text-xl group-hover:scale-110" />
            </button>
          </div>
        ))}

      </div>

      <div className="mt-auto mb-7 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-dashed border-white/10">
        <p className="text-[10px] text-center text-gray-400">
          Recognize a device you don't own? Revoke access immediately and change your password.
        </p>
      </div>
    </div>
  );
};

export default LinkDevice;
