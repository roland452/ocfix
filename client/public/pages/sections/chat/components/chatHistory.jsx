

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useChat from '../context/chat';
import ChatInput from './input/chatInput';
import ChatDisplay from './chatDisplay';
import useSocket from '../context/socketContext'; // ← zustand socket store

const ChatHistory = () => {
  const activeChatId = useChat((state) => state.activeChatId);
  const chatHistories = useChat((state) => state.chatHistories);
  const setChatMessages = useChat((state) => state.setChatMessages);
  const replyingTo = useChat((state) => state.replyingTo);
  const setReplyingTo = useChat((state) => state.setReplyingTo);
  const socket = useSocket((state) => state.socket);

  const currentMessages = chatHistories[activeChatId] || [];
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedFile, setRecordedFile] = useState(null);
  const timerInterval = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentMessages, activeChatId]);

  // Cleanup recording on unmount or chat change
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [activeChatId]);

  // ← NEW: Listen for incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg) => {
      // msg.sender is the person who sent it
      const chatId = msg.sender;
      setChatMessages(chatId, (prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // If this chat is currently open, emit delivered immediately
      if (chatId === activeChatId && msg._id) {
        socket.emit('chat:delivered', { messageIds: [msg._id], senderId: chatId });
      }
    };

    socket.on('chat:message', handleIncoming);
    return () => socket.off('chat:message', handleIncoming);
  }, [socket, activeChatId]);

  // --- RECORDING FUNCTIONS ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        setRecordedFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerInterval.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) { stopRecording(); return prev; }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to send voice notes.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setIsRecording(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSend = async (msgText = text, retryId = null, file = null) => {
    const finalFile = file || recordedFile;
    const finalFieldText = msgText || (finalFile ? "Voice Note" : "");
    if (!finalFieldText.trim() && !finalFile) return;

    const tempId = retryId || Date.now();
    const formData = new FormData();
    formData.append('text', finalFieldText);
    formData.append('clientId', activeChatId);
    if (finalFile) formData.append('file', finalFile);
    if (replyingTo) formData.append('replyTo', replyingTo._id || replyingTo.id);

    if (!retryId) {
      const newMessage = {
        text: finalFieldText,
        sender: 'me',
        status: 'sending',
        id: tempId,
        clientId: activeChatId,
        fileUrl: finalFile ? URL.createObjectURL(finalFile) : null,
        fileType: finalFile?.type || null,
        createdAt: new Date().toISOString(),
        replyTo: replyingTo ? { text: replyingTo.text, id: replyingTo._id || replyingTo.id } : null
      };
      setChatMessages(activeChatId, (prev) => [...prev, newMessage]);
    } else {
      setChatMessages(activeChatId, (prev) =>
        prev.map(m => (m.id === tempId || m._id === tempId) ? { ...m, status: 'sending' } : m)
      );
    }

    setText('');
    setReplyingTo(null);
    setRecordedFile(null);
    setRecordingTime(0);

    try {
      const res = await axios.post('/api/send-chat', formData, { withCredentials: true });
      setChatMessages(activeChatId, (prev) =>
        prev.map(m => (m.id === tempId || m._id === tempId) ? { ...m, ...res.data, status: 'sent' } : m)
      );
    } catch (error) {
      setChatMessages(activeChatId, (prev) =>
        prev.map(m => (m.id === tempId || m._id === tempId) ? { ...m, status: 'error' } : m)
      );
    }
  };

  const deleteMessage = async (msg) => {
    const idToDelete = msg._id || msg.id;
    setChatMessages(activeChatId, (prev) => prev.filter(m => (m._id || m.id) !== idToDelete));
    if (msg._id) {
      try { await axios.delete(`/api/delete-chat/${msg._id}`, { withCredentials: true }); } catch (err) {}
    }
  };

  return (
    <div className="w-full flex flex-col h-[78vh] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide pb-92">
        <ChatDisplay
          activeChatId={activeChatId}
          handleSend={handleSend}
          deleteMessage={deleteMessage}
          setReplyingTo={setReplyingTo}
        />
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        text={text}
        setText={setText}
        handleSend={handleSend}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        recordedFile={recordedFile}
        setRecordedFile={setRecordedFile}
        recordingTime={formatTime(recordingTime)}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
      />
    </div>
  );
};

export default ChatHistory;