import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import Chat from '../model/client/pages/chat/chat.js';
import dotenv from 'dotenv'
dotenv.config()

// userId -> Set of socketIds (a user can have multiple tabs/devices open...........)
const onlineUsers = new Map();

function addOnlineUser(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
}

function removeOnlineUser(userId, socketId) {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) onlineUsers.delete(userId);
}

function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

let io;

export function initSocket(server, corsOptions) {
  const io = new Server(server, { 
    cors: corsOptions,
    transports:['polling', 'websocket']
  })

  // AUTH MIDDLEWARE — same JWT + cookie verification as userAuth.js
  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error('No cookie sent'));

      const parsed = cookie.parse(rawCookie);
      const token = parsed.userToken;
      if (!token) return next(new Error('No userToken cookie'));

      const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    addOnlineUser(userId, socket.id);

    // Tell everyone this user is now online
    socket.broadcast.emit('user-online', { userId });

    // Personal room so REST routes can target this user directly too
    socket.join(userId);

    // Send the new connection the full current online list (so their UI is correct immediately)
    socket.emit('online-users', { userIds: getOnlineUserIds() });

    // Client tells us which chat window is currently open
    socket.on('open-chat', ({ otherUserId }) => {
      socket.data.openChatWith = otherUserId;
    });

    socket.on('close-chat', () => {
      socket.data.openChatWith = null;
    });

    // Mark messages as read (when user opens/views a conversation)
    socket.on('mark-read', async ({ otherUserId }) => {
      try {
        await Chat.updateMany(
          { sender: otherUserId, clientId: userId, status: { $ne: 'read' } },
          { $set: { status: 'read', readAt: new Date() } }
        );
        // Notify the original sender their messages were seen
        io.to(otherUserId).emit('messages-read', { by: userId });
      } catch (err) {
        console.error('mark-read error:', err);
      }
    });

    // Typing indicator
    socket.on('typing', ({ otherUserId }) => {
      io.to(otherUserId).emit('typing', { from: userId });
    });
    socket.on('stop-typing', ({ otherUserId }) => {
      io.to(otherUserId).emit('stop-typing', { from: userId });
    });

    socket.on('disconnect', () => {
      removeOnlineUser(userId, socket.id);
      // Only announce offline once ALL of this user's sockets are gone
      if (!isUserOnline(userId)) {
        socket.broadcast.emit('user-offline', { userId });
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized yet');
  return io;
}

export function emitNewMessage(recipientId, message) {
  if (!io) return;
  io.to(recipientId.toString()).emit('new-message', message);
}

export function getOnlineUserIds() {
  return Array.from(onlineUsers.keys());
}

export { isUserOnline };