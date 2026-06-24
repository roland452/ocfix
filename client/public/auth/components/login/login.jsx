import React, { useState } from 'react';
import { HiOutlineFingerPrint } from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdAttachEmail } from "react-icons/md";
import axios from 'axios';
import useToast from '../../../../src/assets/toast'
// Helper: base64 to ArrayBuffer for browser hardware
const base64ToBuffer = (base64) => {
  const binary = window.atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

// Helper: ArrayBuffer to base64 to send to server
const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const LoginContent = ({ email, setEmail, password, setPassword, handleSubmit, submitting, onLoginSuccess }) => {
  const setToast = useToast((state) => state.setToast);
  const [bioLoading, setBioLoading] = useState(false);

  const handleBiometricLogin = async () => {
    if (!email) return setToast('Enter your email first then tap fingerprint');
    setBioLoading(true);

    try {
      // 1. Get login challenge from backend
      const { data: options } = await axios.get(
        `/api/auth/webauthn/login-options?email=${encodeURIComponent(email)}`
      );

      // 2. Format options for browser hardware
      const publicKeyOptions = {
        ...options,
        challenge: base64ToBuffer(options.challenge),
        allowCredentials: options.allowCredentials?.map(cred => ({
          ...cred,
          id: base64ToBuffer(cred.id)
        }))
      };

      // 3. Trigger fingerprint/face scanner
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyOptions
      });

      // 4. Format response to send to backend
      const assertionJSON = {
        email,
        id: assertion.id,
        response: {
          authenticatorData: bufferToBase64(assertion.response.authenticatorData),
          clientDataJSON: bufferToBase64(assertion.response.clientDataJSON),
          signature: bufferToBase64(assertion.response.signature),
        }
      };

      // 5. Verify with backend
      const { data } = await axios.post(
        '/api/auth/webauthn/login-verify',
        assertionJSON,
        { withCredentials: true }
      );

      setToast('Biometric login successful!');
      if (onLoginSuccess) onLoginSuccess(data);

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setToast('Biometric cancelled or not recognized');
      } else {
        setToast(err.response?.data?.message || 'Biometric login failed');
      }
    } finally {
      setBioLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className="space-y-4">
        {/* Email Input */}
        <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
          <MdAttachEmail className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
          <input
            className="bg-transparent outline-none w-full text-sm dark:text-white"
            type="text"
            placeholder='Email address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[var(--active-color)]/50 transition-all">
          <RiLockPasswordFill className="text-gray-400 group-focus-within:text-[var(--active-color)]" />
          <input
            className="bg-transparent outline-none w-full text-sm dark:text-white"
            type="password"
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Sign In Button */}
      <button
        className="w-full py-4 bg-red-400 rounded-2xl font-bold text-white shadow-lg shadow-[var(--active-color)]/20 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2"
        onClick={() => handleSubmit()}
        disabled={submitting}
      >
        {submitting ? <FaSpinner className="animate-spin" /> : 'Sign In'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
        <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
      </div>

      {/* Biometric Login Button */}
      <button
        onClick={handleBiometricLogin}
        disabled={bioLoading}
        className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[var(--active-color)]/10 hover:border-[var(--active-color)]/30 border border-transparent transition-all group disabled:opacity-50"
      >
        {bioLoading
          ? <FaSpinner className="text-3xl animate-spin text-[var(--active-color)]" />
          : <HiOutlineFingerPrint className="text-3xl text-gray-400 group-hover:text-[var(--active-color)] transition-colors" />
        }
        <span className="text-[10px] text-black dark:text-white font-bold uppercase tracking-widest opacity-40 group-hover:opacity-70 transition-opacity">
          {bioLoading ? 'Scanning...' : 'Fingerprint / Face ID'}
        </span>
      </button>

      <p className="text-center text-[10px] opacity-30">
        Enter your email above before using biometric login
      </p>
    </div>
  );
};

export default LoginContent;


