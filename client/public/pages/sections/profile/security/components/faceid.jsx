import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { FaSpinner } from "react-icons/fa";

const FaceId = () => {
  
  const videoRef = useRef();
  const [status, setStatus] = useState("Loading AI Engine...");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        startVideo();
      } catch (err) {
        setStatus("AI Models failed to load.");
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => { videoRef.current.srcObject = stream; })
      .catch(() => setStatus("Camera access denied"));
    setStatus("Position your face for verification");
  };



  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach(track => {
        track.stop(); // This physically turns off the camera hardware
      });

      videoRef.current.srcObject = null; // This clears the video element
      setStatus("Camera closed");
    }
  };

  const handleEnroll = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setStatus("Analyzing biometric signature...");

    const runDetection = async () => {
      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.4 })
        ).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
          requestAnimationFrame(runDetection);
          return;
        }

        const descriptorArray = Array.from(detection.descriptor);
        setStatus('face found')
        setIsScanning(false)
        console.log(descriptorArray, 'descriptor');
        
        const res = await axios.post('/api/face-register', { faceDescriptor: descriptorArray }, { withCredentials: true });
        if(res.data.success){
          setStatus("saving faceId....");
        }
        setIsScanning(false);
      } catch (err) {
        requestAnimationFrame(runDetection);
        setStatus("failed to save faceId");
      }
    };
    runDetection();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
      

      <div className="relative w-48 h-48 rounded-[3rem] overflow-hidden border-4 border-emerald-500/30 mb-8 shadow-2xl">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
        {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_emerald-500] animate-[scan_2s_linear_infinite]" />}
      </div>

      <div className="text-center max-w-xs space-y-2 mb-8">
        <h3 className="font-bold text-black dark:text-white uppercase tracking-widest text-[10px]">Secure Verification</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-tight">{status}</p>
      </div>

      <button 
        onClick={handleEnroll}
        disabled={isScanning}
        className={`w-full max-w-[240px] py-4 rounded-2xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-3 ${isScanning ? 'bg-gray-400' : 'bg-emerald-600 shadow-lg shadow-emerald-600/20'}`}
      >
        {isScanning ? 'proccessing...' : "Register FaceId"}
      </button>
    </div>
  );
};

export default FaceId;
