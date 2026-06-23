import React, { useState } from 'react';
import { MdFingerprint, MdCheckCircle, MdSecurity } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";
import useToast from "../../../../../context/toast";

const Fingerprint = () => {
  const setToast = useToast((state) => state.setToast);
  const [isScanning, setIsScanning] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // REAL WORLD HELPER: Converts Base64 from Backend to ArrayBuffer for the Browser Hardware
  const bufferFromBase64 = (base64) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  // REAL WORLD HELPER: Converts Browser Binary result to Base64 to send to your MongoDB
  const bufferToBase64 = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  const handleRegister = async () => {
    setIsScanning(true);
    try {
      // 1. STEP ONE: Get "Challenge" from Backend
      // The backend must provide a unique string so hackers can't "replay" an old scan.
      const { data: options } = await axios.get('/api/auth/webauthn/register-options');

      // 2. STEP TWO: Format options for the hardware
      const publicKeyCredentialCreationOptions = {
        ...options,
        challenge: bufferFromBase64(options.challenge),
        user: {
          ...options.user,
          id: bufferFromBase64(options.user.id),
        },
      };

      // 3. STEP THREE: Trigger the native Windows Hello / Fingerprint UI
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      // 4. STEP FOUR: Format the hardware response to send back to Server
      const credentialJSON = {
        id: credential.id,
        rawId: bufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64(credential.response.attestationObject),
          clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        },
      };

      // 5. STEP FIVE: Send to Backend for final validation and storage
      await axios.post('/api/auth/webauthn/register-verify', credentialJSON);
      
      setIsRegistered(true);
      setToast("Biometric identity verified and saved.");
    } catch (err) {
      console.error("Biometric Error:", err);
      setToast(err.response?.data?.message || "Biometric setup failed.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-8 max-w-xl mx-auto">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-black dark:text-white">Security Key</h1>
        <p className="text-gray-500 text-sm">Link your device hardware to your Octfix account.</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 bg-black/5 dark:bg-white/5 p-10 rounded-[3rem] border border-black/6 dark:border-white/5 shadow-inner relative overflow-hidden">
        {isScanning && <div className="absolute inset-0 bg-[var(--active-color)]/5 animate-pulse" />}

        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-500 ${
          isRegistered ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[var(--active-color)]/10 text-[var(--active-color)]'
        }`}>
          {isScanning ? <FaSpinner className="animate-spin text-3xl" /> : isRegistered ? <MdCheckCircle /> : <MdFingerprint />}
          {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-[var(--active-color)] shadow-[0_0_15px_var(--active-color)] animate-scan" />}
        </div>

        <div className="text-center z-10">
          <h3 className="font-bold text-lg text-black dark:text-white">
            {isRegistered ? "Hardware Trusted" : "Biometric Enrollment"}
          </h3>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mt-1">
            {isRegistered ? "Face/Fingerprint Active" : "Click to initialize scanner"}
          </p>
        </div>

        {!isRegistered && (
          <button 
            onClick={handleRegister}
            disabled={isScanning}
            className="w-full py-4 rounded-2xl font-bold bg-[var(--active-color)] text-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isScanning ? "Waiting for Hardware..." : "Link This Device"}
          </button>
        )}
      </div>

      <div className="flex gap-4 p-5 rounded-2xl bg-black/5 dark:bg-black/20 border border-black/6 dark:border-white/5">
        <MdSecurity className="text-2xl text-[var(--active-color)] shrink-0" />
        <p className="text-[10px] text-gray-400 leading-relaxed">
          <strong>Real-World Security:</strong> This process creates a unique cryptographic credential on your HP Laptop. Octfix never sees your actual fingerprint; we only store a public key to verify your future logins.
        </p>
      </div>

      <style jsx>{`
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default Fingerprint;
