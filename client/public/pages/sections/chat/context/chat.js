import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

const useChat = create()(
  persist((set) => ({
    activeChatId: '',
    chatHistories: {},
    replyingTo: null,
    conversations: [],
    activeChat: null, // FIX: was [] should be null
    fundProjectModal: false,
    reviewModal: false,
    projectProofs: {},
    sideBarActive: true,

    setActiveChatId: (id) => set({ activeChatId: id, replyingTo: null }),
    setReplyingTo: (msg) => set({ replyingTo: msg }),

    setChatMessages: (chatId, update) => set((state) => ({
      chatHistories: {
        ...state.chatHistories,
        [chatId]: typeof update === 'function'
          ? update(state.chatHistories[chatId] || [])
          : update
      }
    })),

    setProjectProof: (key, value) => set((state) => ({
      projectProofs: {
        ...state.projectProofs,
        [key]: typeof value === 'function'
          ? value(state.projectProofs[key] || {})
          : value
      }
    })),

    setConversations: (value) => set({ conversations: value }),
    setActiveChat: (value) => set({ activeChat: value }),
    setFundProjectModal: (value) => set({ fundProjectModal: value }),
    setReviewModal: (value) => set({ reviewModal: value }),
    setSideBarActive: (value) => set({ sideBarActive: value }),
  }),
  {
    name: 'chat-session',
    storage: createJSONStorage(() => sessionStorage)
  })
);

export default useChat;