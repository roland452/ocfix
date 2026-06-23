import React, { useState, useEffect } from 'react';
import { MdCameraAlt, MdNotificationsActive, MdLocationOn, MdMic } from "react-icons/md";

const Permission = () => {
  const [permissions, setPermissions] = useState({
    notification: Notification.permission === 'granted',
    camera: false,
    mic: false,
    location: false
  });

  // Function to request hardware access
  const requestAccess = async (type) => {
    try {
      if (type === 'camera' || type === 'mic') {
        const constraints = { 
          video: type === 'camera', 
          audio: type === 'mic' 
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // Success: Close the stream immediately as we only wanted to test/grant permission
        stream.getTracks().forEach(track => track.stop());
        setPermissions(prev => ({ ...prev, [type]: true }));
      } 
      
      if (type === 'notification') {
        const status = await Notification.requestPermission();
        setPermissions(prev => ({ ...prev, notification: status === 'granted' }));
      }

      if (type === 'location') {
        navigator.geolocation.getCurrentPosition(() => {
          setPermissions(prev => ({ ...prev, location: true }));
        });
      }
    } catch (err) {
      console.error(`${type} access denied:`, err);
      setPermissions(prev => ({ ...prev, [type]: false }));
    }
  };

  const permissionItems = [
    { id: 'notification', label: 'Notifications', icon: <MdNotificationsActive />, action: 'notification', desc: 'Get alerts for new chat messages and security updates.' },
    { id: 'camera', label: 'Camera', icon: <MdCameraAlt />, action: 'camera', desc: 'Required for biometric Face ID and profile photos.' },
    { id: 'mic', label: 'Microphone', icon: <MdMic />, action: 'mic', desc: 'Enable voice notes and audio calls in the chat section.' },
    { id: 'location', label: 'Location', icon: <MdLocationOn />, action: 'location', desc: 'Used to suggest local service providers near you.' },
  ];

  return (
    <div className="p-6 h-full flex flex-col gap-6 bg-[var(--l-bg)] dark:bg-[var(--d-bg)]">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">System Permissions</h1>
        <p className="text-gray-500 text-sm">Grant access to hardware for Octfix features.</p>
      </div>

      <div className="flex flex-col gap-3">
        {permissionItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border  border-black/6 dark:border-white/5 hover:border-[var(--active-color)]/20 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={`text-2xl text-[var(--active-color)] p-2 rounded-xl bg-[var(--active-color)]/10`}>
                {item.icon}
              </div>
             <div className="flex flex-col">
                <h3 className="font-semibold text-sm text-black dark:text-white">{item.label}</h3>
                <p className="text-[11px] text-gray-500 max-w-[200px] leading-tight">{item.desc}</p>
              </div>
             
            </div>

            <button 
              onClick={() => requestAccess(item.action)}
             className={`w-11 h-6 rounded-full transition-all duration-300 relative shadow-inner ${
                permissions[item.id] ? 'bg-[var(--active-color)]' : 'bg-gray-300 dark:bg-white/10'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
                permissions[item.id] ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
        ))}
      </div>

       {/* Security Status Footer */}
      <div className="mt-auto p-4 mb-7 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">
          All systems secured with biometric encryption
        </p>
      </div>

    </div>
  );
};

export default Permission;
