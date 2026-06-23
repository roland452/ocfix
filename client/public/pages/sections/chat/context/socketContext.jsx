import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useSocket = create((set, get) => ({
  socket: null,
  onlineUserIds: new Set(),
  typingFrom: null,

  connectSocket: () => {
    if (get().socket) return; // already connected

    const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
      withCredentials: true, // sends the httpOnly userToken cookie automatically
    });

    socket.on('online-users', ({ userIds }) => {
      set({ onlineUserIds: new Set(userIds) });
    });

    socket.on('user-online', ({ userId }) => {
      set((state) => {
        const next = new Set(state.onlineUserIds);
        next.add(userId);
        return { onlineUserIds: next };
      });
    });

    socket.on('user-offline', ({ userId }) => {
      set((state) => {
        const next = new Set(state.onlineUserIds);
        next.delete(userId);
        return { onlineUserIds: next };
      });
    });

    socket.on('typing', ({ from }) => set({ typingFrom: from }));
    socket.on('stop-typing', () => set({ typingFrom: null }));

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUserIds: new Set(), typingFrom: null });
    }
  },

  isOnline: (userId) => get().onlineUserIds.has(userId),
}));

export default useSocket;
