import React, { useState } from 'react';
import { MdEmail, MdOutlineSecurity, MdVerifiedUser } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import useToast from "../../../../../context/toast";
import useProfile from '../../../../../context/profile'

const TwoFactor = () => {


  const profile = useProfile((state) => state.profile)
  const setToast = useToast((state) => state.setToast);

  const twoFactorEnabled = profile.data.twoFactorEnabled || false
  
  

  // States for UI flow
  const [isEnabled, setIsEnabled] = useState(twoFactorEnabled); // Track if 2FA is active
  const [isVerifying, setIsVerifying] = useState(false); // Show the OTP input field
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');

  // Step 1: Request the code to be sent to user's email
  const handleToggle = async () => {
    if (!isEnabled) {
      setIsLoading(true);
      try {
        // Your backend route to generate and mail the OTP
        const res = await axios.post('/api/2fa/setup', {}, { withCredentials: true });
        setToast(res.data.message || "Verification code sent to your email");
        setIsVerifying(true);
      } catch (error) {
        setToast(error.response?.data?.message || "Failed to send code");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Logic to disable 2FA
      setIsEnabled(false);
      setToast("Email 2FA disabled");
    }
  };

  // Step 2: Submit the OTP to finalize activation
  const verifyAndEnable = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/2fa/verify', { code: otp }, { withCredentials: true });
      setToast(res.data.message || "2FA successfully enabled!");
      setIsEnabled(true);
      setIsVerifying(false);
      setOtp('');
    } catch (error) {
      setToast(error.response?.data?.message || "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-8 max-w-xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-black dark:text-white">Two-Factor Authentication</h1>
        <p className="text-gray-500 text-sm">Add an extra layer of security to your Octfix account.</p>
      </div>

      <div className="flex flex-col gap-6 bg-black/5 dark:bg-white/5 p-8 rounded-[2.5rem] border border-black/6 dark:border-white/5 shadow-inner">
        
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${isEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[var(--active-color)]/10 text-[var(--active-color)]'}`}>
              {isEnabled ? <MdVerifiedUser /> : <MdEmail />}
            </div>
            <div>
              <h3 className="font-bold text-black dark:text-white">Email Verification</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                Status: <span className={isEnabled ? "text-emerald-500" : "text-gray-400"}>
                  {isEnabled ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>

          <button 
            onClick={handleToggle}
            disabled={isLoading || isVerifying}
            className={`w-12 h-6 rounded-full transition-all relative ${isEnabled ? 'bg-emerald-500' : 'bg-gray-400/30'} ${isLoading ? 'opacity-50' : ''}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Verification Logic: Appears after clicking toggle */}
        {isVerifying && (
          <div className="mt-4 pt-6 border-t border-white/5 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
            <p className="text-xs text-center text-gray-400 px-4">
              We've sent a 6-digit code to your email. Enter it below to confirm.
            </p>
            
            <input 
              type="text"
              maxLength="6"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-black/20 border border-[var(--active-color)]/20 rounded-2xl p-4 text-center text-2xl tracking-[1rem] font-mono outline-none focus:border-[var(--active-color)] transition-all"
            />

            <div className="flex gap-3">
              <button 
                onClick={verifyAndEnable}
                disabled={otp.length !== 6 || isLoading}
                className="flex-1 py-4 bg-[var(--active-color)] text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? <FaSpinner className="animate-spin mx-auto" /> : "Verify & Enable"}
              </button>
              <button 
                onClick={() => setIsVerifying(false)}
                className="px-6 py-4 bg-white/5 text-gray-400 text-xs rounded-2xl hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
        <MdOutlineSecurity className="text-2xl text-blue-500 shrink-0" />
        <p className="text-[11px] text-gray-500 leading-tight">
          When enabled, you'll need to enter a code sent to your email every time you log in from a new device or session.
        </p>
      </div>
    </div>
  );
};

export default TwoFactor;
