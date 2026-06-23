import React, { useState, useRef } from 'react';
import { BsShieldLockFill, BsArrowLeft, BsCheckCircleFill } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa";
import useToast from '../../../context/toast';
import { useNavigate } from "react-router-dom";
import axios from 'axios';



const TwoFactor = ({ onVerify, onBack }) => {

  const navigate = useNavigate();
  const pendingEmail = sessionStorage.getItem('pendingEmail') || ''
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);
  const setToast = useToast((state) => state.setToast);

  // Handle input change
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return setToast("Please enter the full 5-digit code");

    setIsLoading(true);
    try {
      // Logic placeholder similar to your saveChanges pattern
      const res = await axios.post('/api/verify-2fa/login', {email:pendingEmail, code }); 
      setIsLoading(false);
      setToast(res.data.message)
      if(res.data.success) {
        setIsSuccess(true)
        setTimeout(() => navigate('/dashboard'), 2000);
      }
      
    } catch (error) {
      setIsLoading(false);
      setToast(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative overflow-hidden">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute text-sm font-semibold left-0 bottom-[-10px] p-2 text-slate-400 hover:text-[var(--active-color)] transition-colors"
        >
            back
        </button>

        <div className="flex flex-col items-center text-center gap-3 overflow-hidden">
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight dark:text-white">Two-Step Verification</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Enter the 6-digit code sent to your email to continue.
            </p>
          </div>

          {/* OTP Input Grid */}
          <div className="flex gap-2 sm:gap-3 mt-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 focus:border-[var(--active-color)] focus:ring-4 focus:ring-[var(--active-color)]/10 outline-none transition-all dark:text-white [&::-webkit-scrollbar]:hidden"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading || isSuccess}
            className={`
              w-full h-14 mt-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 
              ${isSuccess 
                ? 'bg-green-500 text-white' 
                : 'bg-green-400 shadow-lg shadow-[var(--active-color)]/30 hover:brightness-110'}
            `}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" />
            ) : isSuccess ? (
              <><BsCheckCircleFill /> Verified</>
            ) : (
              "Verify Account"
            )}
          </button>

          <button 
            className="text-sm font-semibold text-[var(--active-color)] hover:underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
            onClick={() => setOtp(['', '', '', '', '', ''])}
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactor;
