import React, { useState, useEffect } from 'react';
import { MdFingerprint, MdCheckCircle, MdSecurity, MdDeleteForever } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import useToast from "../../../../../context/toast";

const Fingerprint = () => {
  const setToast = useToast((state) => state.setToast);
  const [isScanning, setIsScanning] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  // Check if user already has fingerprint registered
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const res = await axios.get('/api/auth/webauthn/status', { withCredentials: true });
        setIsRegistered(res.data.registered);
      } catch (err) {
        setIsRegistered(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkRegistration();
  }, []);

  // Helper: Base64 from Backend → ArrayBuffer for Browser Hardware
  const bufferFromBase64 = (base64) => {
    const binary = window.atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  // Helper: Browser Binary → Base64 for MongoDB
  const bufferToBase64 = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  const handleRegister = async () => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      return setToast('Your browser does not support biometric login');
    }

    setIsScanning(true);
    try {
      // 1. Get challenge from backend
      const { data: options } = await axios.get(
        '/api/auth/webauthn/register-options',
        { withCredentials: true }
      );

      // 2. Format options for the hardware
      const publicKeyCredentialCreationOptions = {
        ...options,
        challenge: bufferFromBase64(options.challenge),
        user: {
          ...options.user,
          id: bufferFromBase64(options.user.id),
        },
      };

      // 3. Trigger native Windows Hello / Fingerprint UI
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      // 4. Format hardware response to send to server
      const credentialJSON = {
        id: credential.id,
        rawId: bufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64(credential.response.attestationObject),
          clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        },
      };

      // 5. Send to backend for validation and storage
      await axios.post(
        '/api/auth/webauthn/register-verify',
        credentialJSON,
        { withCredentials: true }
      );

      setIsRegistered(true);
      setToast('Biometric identity verified and saved ✅');

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setToast('Biometric cancelled or not allowed');
      } else if (err.name === 'InvalidStateError') {
        setToast('This device is already registered');
        setIsRegistered(true);
      } else {
        setToast(err.response?.data?.message || 'Biometric setup failed');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await axios.delete('/api/auth/webauthn/remove', { withCredentials: true });
      setIsRegistered(false);
      setToast('Biometric removed successfully');
    } catch (err) {
      setToast('Failed to remove biometric');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-black dark:text-white">Fingerprint ID</h1>
        <p className="text-gray-500 text-sm">Link your device hardware to your Octfix account.</p>
      </div>

      {/* Scanner Card */}
      <div className="flex flex-col items-center justify-center gap-6 bg-black/5 dark:bg-white/5 p-10 rounded-[3rem] border border-black/6 dark:border-white/5 shadow-inner relative overflow-hidden">
        {isScanning && <div className="absolute inset-0 bg-[var(--active-color)]/5 animate-pulse" />}

        {/* Icon */}
        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-500 ${
          isRegistered
            ? 'bg-emerald-500/20 text-emerald-500'
            : 'bg-[var(--active-color)]/10 text-[var(--active-color)]'
        }`}>
          {isLoading
            ? <FaSpinner className="animate-spin text-3xl" />
            : isScanning
            ? <FaSpinner className="animate-spin text-3xl" />
            : isRegistered
            ? <MdCheckCircle />
            : <MdFingerprint />
          }
          {isScanning && (
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--active-color)] shadow-[0_0_15px_var(--active-color)] animate-scan" />
          )}
        </div>

        {/* Status Text */}
        <div className="text-center z-10">
          <h3 className="font-bold text-lg text-black dark:text-white">
            {isLoading
              ? 'Checking status...'
              : isRegistered
              ? 'Hardware Trusted'
              : 'Biometric Enrollment'
            }
          </h3>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mt-1">
            {isLoading
              ? ''
              : isRegistered
              ? '✓ Face / Fingerprint Active'
              : 'Click to initialize scanner'
            }
          </p>
        </div>

        {/* Register Button */}
        {!isLoading && !isRegistered && (
          <button
            onClick={handleRegister}
            disabled={isScanning}
            className="w-full py-4 rounded-2xl font-bold bg-[var(--active-color)] text-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isScanning ? 'Waiting for Hardware...' : 'Link This Device'}
          </button>
        )}

        {/* Remove Button — shown when registered */}
        {!isLoading && isRegistered && (
          <button
            onClick={handleRemove}
            disabled={removing}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50 text-sm"
          >
            {removing
              ? <FaSpinner className="animate-spin" size={14} />
              : <MdDeleteForever size={18} />
            }
            {removing ? 'Removing...' : 'Remove Biometric'}
          </button>
        )}
      </div>

      {/* Security Note */}
      <div className="flex gap-4 p-5 rounded-2xl bg-black/5 dark:bg-black/20 border border-black/6 dark:border-white/5">
        <MdSecurity className="text-2xl text-[var(--active-color)] shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed">
          <strong>Real-World Security:</strong> This creates a unique cryptographic credential on your device.
          Octfix never sees your actual fingerprint — we only store a public key to verify future logins.
          Your biometric data never leaves your device.
        </p>
      </div>

      <style>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default Fingerprint;