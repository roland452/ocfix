
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useChat from '../context/chat';
import useSocket from '../context/socketContext'; // ← zustand socket store
import { motion, AnimatePresence } from 'framer-motion';
import { BiMessageSquareDetail } from 'react-icons/bi';

const ChatWindow = () => {
  const setActiveChatId = useChat((state) => state.setActiveChatId);
  const setActiveChat = useChat((state) => state.setActiveChat);
  const activeChatId = useChat((state) => state.activeChatId);
  const isOnline = useSocket((state) => state.isOnline);
  const socket   = useSocket((state) => state.socket);

  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchChats = async (isNewFilter = false, overridePage) => {
    setLoading(true);
    const targetPage = overridePage ?? (isNewFilter ? 1 : page);
    const cacheKey = `chats_${filter}_${targetPage}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached && isNewFilter) setConversations(JSON.parse(cached));

    try {
      const res = await axios.get(`/api/get-chats?filter=${filter}&page=${targetPage}`, { withCredentials: true });
      if (res.data.length < 10) setHasMore(false);
      else setHasMore(true);
      const updatedList = isNewFilter ? res.data : [...conversations, ...res.data];
      setConversations(updatedList);
      sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setConversations([]);
    setPage(1);
    setHasMore(true);
    fetchChats(true, 1);
  }, [filter]);

  useEffect(() => {
    if (page === 1) return;
    fetchChats(false, page);
  }, [page]);

  // Socket: increment unread count on incoming messages in other chats
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // Only update unread if it's NOT the currently open chat
      if (msg.sender === activeChatId) return;

      setConversations((prev) =>
        prev.map((chat) => {
          const otherPersonId = chat.userType === 'poster'
            ? chat.clientId?._id
            : chat.approvedBy?._id;

          if (otherPersonId === msg.sender) {
            return {
              ...chat,
              unreadCount: (chat.unreadCount || 0) + 1,
              lastMessage: msg.text,
            };
          }
          return chat;
        })
      );
    };

    socket.on('chat:message', handleNewMessage);
    return () => socket.off('chat:message', handleNewMessage);
  }, [socket, activeChatId]);

  // Clear unread count when a chat is opened
  const handleOpenChat = (chat, otherPersonId) => {
    setActiveChatId(otherPersonId);
    setActiveChat(chat);
    // Clear unread locally
    setConversations((prev) =>
      prev.map((c) => c._id === chat._id ? { ...c, unreadCount: 0 } : c)
    );
    // Tell server to mark messages as read
    if (socket) {
      socket.emit('chat:markRead', { conversationId: chat._id });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[var(--d-bg)]">
      <div className="p-6 pb-2 space-y-4">
        <h1 className="text-2xl font-black">Messages</h1>
        <div className="flex gap-2">
          {['all', 'hired', 'unhired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-[var(--active-color)] text-white' : 'bg-slate-100 dark:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 md:px-4 pb-10">
        <AnimatePresence>
          {conversations.map((chat) => {
            const otherPerson = chat.userType === 'poster'
              ? chat.clientId
              : chat.approvedBy;

            const otherPersonId = chat.userType === 'poster'
              ? chat.clientId?._id
              : chat.approvedBy?._id;

            const online = isOnline(otherPersonId);
            const unread = chat.unreadCount || 0;

            return (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleOpenChat(chat, otherPersonId)}
                className="p-4 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-all"
              >
                {/* Avatar with online dot */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full ring-2 ring-[var(--active-color)]/20 p-0.5">
                    <div className="w-full h-full capitalize rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden flex items-center justify-center font-bold text-[var(--active-color)]">
                      {!otherPerson?.image
                        ? otherPerson?.name?.[0]
                        : <img src={otherPerson.image} alt="" className="w-full h-full object-cover" />
                      }
                    </div>
                  </div>
                  {/* Online dot */}
                  <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[var(--d-bg)] ${online ? 'bg-green-500' : 'bg-zinc-400'}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className={`font-bold text-sm truncate capitalize ${unread > 0 ? 'text-[var(--active-color)]' : ''}`}>
                      {otherPerson?.name}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {chat.isHired && (
                        <span className="text-[9px] font-black text-[var(--active-color)] bg-[var(--active-color)]/10 px-2 py-0.5 rounded-full">
                          HIRED
                        </span>
                      )}
                      {/* Unread badge */}
                      {unread > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[var(--active-color)] text-white text-[9px] font-black rounded-full">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs opacity-50 truncate">
                    {chat.jobOfferId?.description || chat.jobOfferId?.about || "Ongoing Project"}
                  </p>
                  {chat.lastMessage && (
                    <p className={`text-[10px] truncate mt-0.5 italic ${unread > 0 ? 'opacity-70 font-semibold' : 'opacity-30'}`}>
                      {chat.lastMessage}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {hasMore && !loading && conversations.length > 0 && (
          <button
            onClick={() => setPage(p => p + 1)}
            className="w-full py-4 text-xs font-bold text-[var(--active-color)] bg-[var(--active-color)]/5 rounded-2xl"
          >
            Load More Chats
          </button>
        )}

        {loading && <p className="text-center text-xs opacity-50 py-4">Loading...</p>}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-30">
            <BiMessageSquareDetail size={40} />
            <p className="text-xs font-bold">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

