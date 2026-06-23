import { GrDocumentPdf } from "react-icons/gr";
import React from 'react';
import { useEffect, useState, useRef } from "react";
import { MdReplyAll, MdDelete, MdErrorOutline, MdCheck, MdDoneAll, MdRefresh } from "react-icons/md";
import { FaPlay, FaPause, FaMicrophone } from "react-icons/fa";
import axios from 'axios';
import EmptyChat from "./extras/emptyChat";
import useChat from "../context/chat";
import useToast from '../../../../context/toast';
import FundProject from "./finaces/fundProject";
import ReviewProject from "./finaces/projectReview";
import SideBar from './bars/sideBar';
import useSocket from '../context/socketContext';

// ─── Voice Note Player ────────────────────────────────────────────────────────
const VoiceNotePlayer = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-2xl w-54 border border-white/5">
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} className="hidden" />
      <button onClick={togglePlay} className="w-9 h-9 flex items-center justify-center bg-[var(--active-color)] rounded-full text-white shadow-lg">
        {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
      </button>
      <div className="flex-1 flex items-end gap-[2px] h-5">
        {[...Array(18)].map((_, i) => (
          <div key={i} className={`w-[2px] bg-[var(--active-color)] rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
            style={{ height: `${20 + Math.random() * 80}%` }} />
        ))}
      </div>
      <FaMicrophone className="text-[var(--active-color)] text-sm" />
    </div>
  );
};

// ─── Message Status Ticks ─────────────────────────────────────────────────────
const MessageStatus = ({ status, isMe, time }) => {
  const timeStr = time
    ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="flex items-center gap-1 mt-1 opacity-60">
      <span className="text-[9px]">{timeStr}</span>
      {isMe && (
        <>
          {status === 'sending'   && <MdCheck   className="text-white/40 text-[12px]" />}
          {status === 'sent'      && <MdCheck   className="text-white/80 text-[12px]" />}
          {status === 'delivered' && <MdDoneAll className="text-white/80 text-[12px]" />}
          {status === 'read'      && <MdDoneAll className="text-[var(--active-color)] text-[12px]" />}
          {status === 'error'     && <MdErrorOutline className="text-red-400 text-[12px]" />}
        </>
      )}
    </div>
  );
};

// ─── ChatDisplay ──────────────────────────────────────────────────────────────
const ChatDisplay = ({ setReplyingTo, deleteMessage, handleSend, activeChatId }) => {
  const setToast        = useToast((state) => state.setToast);
  const chatHistories   = useChat((state) => state.chatHistories);
  const setChatMessages = useChat((state) => state.setChatMessages);
  const currentMessages = chatHistories[activeChatId] || [];
  const activeChat      = useChat((state) => state.activeChat);
  const setFundProjectModal = useChat((state) => state.setFundProjectModal);
  const fundProjectModal    = useChat((state) => state.fundProjectModal);
  const reviewModal         = useChat((state) => state.reviewModal);
  const setReviewModal      = useChat((state) => state.setReviewModal);

  const socket = useSocket((state) => state.socket);

  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get('/api/balance', { withCredentials: true });
        setUserBalance(res.data.balance || 0);
      } catch (err) { console.error(err); }
    };
    fetchBalance();
  }, []);

  // Fetch history when chat changes
  useEffect(() => {
    if (!activeChatId) return;
    setToast('fetching updated chat...');
    async function fetchChat() {
      try {
        const res = await axios.get(`/api/get-chats/${activeChatId}`, { withCredentials: true });
        setChatMessages(activeChatId, res.data);
        setToast('fetch was successful');
      } catch (error) {
        setToast('failed to fetch updated chat');
      }
    }
    fetchChat();
  }, [activeChatId]);

  // ── SOCKET: receive incoming messages ─────────────────────────────────────
  // Server emits 'new-message' via emitNewMessage() in the send-chat route
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg) => {
      // msg.sender is the other user's ID — matches activeChatId when chat is open
      if (String(msg.sender) !== String(activeChatId)) return;

      setChatMessages(activeChatId, (prev) => {
        if (prev.some((m) => m._id && m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on('new-message', handleIncoming);
    return () => socket.off('new-message', handleIncoming);
  }, [socket, activeChatId]);

  // ── SOCKET: mark messages as read when chat is open ───────────────────────
  // Server listens for 'mark-read' and emits 'messages-read' back to sender
  useEffect(() => {
    if (!socket || !activeChatId) return;

    // Tell server to mark all messages from this person as read
    socket.emit('mark-read', { otherUserId: activeChatId });

    // Also tell server this chat window is open (for auto-read on new arrivals)
    socket.emit('open-chat', { otherUserId: activeChatId });

    return () => {
      socket.emit('close-chat');
    };
  }, [activeChatId, socket]);

  // ── SOCKET: update YOUR sent message ticks when receiver reads ────────────
  // Server emits 'messages-read' when the other person opens the chat
  useEffect(() => {
    if (!socket) return;

    const handleRead = ({ by }) => {
      // 'by' is the userId who read — should match activeChatId
      if (String(by) !== String(activeChatId)) return;

      setChatMessages(activeChatId, (prev) =>
        prev.map((m) =>
          m.sender !== activeChatId ? { ...m, status: 'read' } : m
        )
      );
    };

    socket.on('messages-read', handleRead);
    return () => socket.off('messages-read', handleRead);
  }, [socket, activeChatId]);

  const onClose = () => {
    setFundProjectModal(false);
    setReviewModal(false);
  };

  const jobData    = activeChat?.jobOfferId;
  const clientInfo = activeChat?.clientId;
  const contract   = activeChat?.contract;
  const userType   = activeChat?.userType;

  return (
    <div className="flex flex-col gap-4 p-2">
      <EmptyChat />

      {currentMessages.map((msg, i) => {
        const isMe = String(msg.sender) !== String(activeChatId);

        return (
          <div key={msg._id || msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] group relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>

              <div className={`relative p-2 rounded-2xl text-sm shadow-sm ${
                isMe
                  ? 'bg-main text-white rounded-tr-none'
                  : 'bg-[var(--active-color)] dark:bg-zinc-800 text-white rounded-tl-none'
              }`}>

                {msg.replyTo && (
                  <div className="mb-2 p-2 rounded-xl border-l-4 border-secondary text-xs bg-black/35 text-white/70">
                    <p className="truncate italic opacity-100 font-medium">replied to: {msg.replyTo.text}</p>
                  </div>
                )}

                {msg.fileUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden bg-black/20">
                    {msg.fileType?.includes('audio') || msg.text === "Voice Note" ? (
                      <VoiceNotePlayer url={msg.fileUrl} />
                    ) : msg.fileType?.includes('image') ? (
                      <img src={msg.fileUrl} className="max-h-64 w-full object-cover" alt="sent file" />
                    ) : msg.fileType?.includes('video') ? (
                      <video src={msg.fileUrl} controls className="max-h-64 w-full object-cover" />
                    ) : (
                      <div className="p-3 flex items-center gap-2 bg-black/20">
                        <span><GrDocumentPdf className="text-red-400 text-2xl" /></span>
                        <span className="truncate flex-1 font-medium">{msg.text || "File"}</span>
                        <a href={msg.fileUrl} target="_blank" rel="noreferrer"
                          className="text-[var(--active-color)] font-bold text-xs underline">OPEN</a>
                      </div>
                    )}
                  </div>
                )}

                <div className={`whitespace-pre-wrap break-words text-[12px] px-1 leading-relaxed ${
                  msg.text === "Voice Note" && msg.fileUrl ? "hidden" : ""
                }`}>
                  {msg.text}
                </div>

                <div className="flex justify-end">
                  <MessageStatus status={msg.status} isMe={isMe} time={msg.createdAt} />
                </div>
              </div>

              <div className={`flex items-center gap-3 mt-1 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
                <MdReplyAll
                  className="cursor-pointer text-zinc-500 hover:text-[var(--active-color)]"
                  onClick={() => setReplyingTo(msg)}
                />
                <MdDelete
                  className="cursor-pointer text-zinc-500 hover:text-red-500"
                  onClick={() => deleteMessage(msg)}
                />
                {msg.status === 'error' && (
                  <button
                    onClick={() => handleSend(msg.text, msg._id || msg.id)}
                    className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full uppercase hover:bg-red-500/20 transition-colors"
                  >
                    <MdRefresh className="text-xs" /> Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {fundProjectModal && (
        <FundProject onClose={onClose} jobData={jobData} clientInfo={clientInfo} userBalance={userBalance} />
      )}
      {reviewModal && (
        <ReviewProject contract={contract} userType={userType} onClose={onClose} />
      )}
      <SideBar />
    </div>
  );
};

export default ChatDisplay;





