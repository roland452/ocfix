import React from 'react';
import { FaUser, FaEnvelope, FaPhoneAlt, FaLink, FaCalendarAlt, FaBirthdayCake, FaInfoCircle, FaEdit } from 'react-icons/fa';
import { HiOutlineBadgeCheck } from "react-icons/hi";
import useSettingPopup from '../context/setting-popup-context';
import useProfile from '../../../../context/profile';


const AccountInfo = () => {
  const profile = useProfile((state) => state.profile);
  const userProfile = profile.data || [];

  const setSection = useSettingPopup((state) => state.setSection);

  

  // Dummy Data
  const userData = {
    name: userProfile.name || "Guest Octfix",
    image: userProfile.image || <FaUser />,
    email: userProfile.email || "Guest@octfix.com",
    about: userProfile.about || " ",
    phone: userProfile.phone || '+234',
    dob: userProfile.birthdate || " ",
    link: userProfile.link || "https://portfolio.octfix.com",
    status: userProfile.status || "Unverified",
    joined: userProfile.createdAt || "March 2024"
  };

  const InfoCard = ({ icon, label, value, isLink }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-[var(--active-color)]/30 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-[var(--active-color)]/10 text-[var(--active-color)] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--active-color)] hover:underline truncate block">
            {value.replace('https://', '')}
          </a>
        ) : (
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 h-full overflow-scroll [&::-webkit-scrollbar]:hidden">
      
      {/* Profile Header Card */}
      <div className="relative overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl shadow-black/5 group">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--active-color)]/10 blur-3xl rounded-full" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          {/* Avatar Area */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-4xl text-slate-400 border-2 border-white dark:border-slate-800 shadow-lg">
              { userProfile.image ? <img src={userData.image} alt="" className='rounded-3xl'/> : userData.image }
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white dark:border-[#0f172a]">
              <HiOutlineBadgeCheck size={18} />
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold dark:text-white">{userData.name}</h1>
            <p className="text-[var(--active-color)] font-medium text-sm">{userData.status}</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
              <span>Member since {userData.joined}</span>
            </div>
          </div>

          <button className="px-5 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-2 hover:bg-[var(--active-color)] hover:text-white transition-all active:scale-95" onClick={() => setSection('profile')}>
            <FaEdit /> Edit Profile
          </button>
        </div>

        {/* About Section */}
        <div className="mt-8 p-5 rounded-3xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <FaInfoCircle size={14}/>
            <span className="text-[10px] font-bold uppercase tracking-widest">About</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {userData.about}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-2">General Info</h2>
          <InfoCard icon={<FaPhoneAlt />} label="Phone" value={`${userData.phone}`} />
          <InfoCard icon={<FaCalendarAlt />} label="Birth Date" value={new Date(userData.dob).toDateString()} />
        </section>

        <section className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-2">Contact & Links</h2>
          <InfoCard icon={<FaEnvelope />} label="Email Address" value={userData.email} />
          <InfoCard icon={<FaLink />} label="Portfolio" value={userData.link} isLink />
        </section>
      </div>

    </div>
  );
};

export default AccountInfo;
