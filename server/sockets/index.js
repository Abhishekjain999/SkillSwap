import { Message } from '../models/Message.js';
import { Session } from '../models/Session.js';

export const setupSockets = (io) => {
  // Map of userId -> socketId and socketId -> userId
  const onlineUsers = new Map();
  // Map of roomId -> Set of socketIds with participant info
  const roomParticipants = new Map();

  io.on('connection', (socket) => {
    // 1. User Online Tracking
    socket.on('user-connected', (userId) => {
      if (userId) {
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);
        io.emit('online-users-updated', Array.from(onlineUsers.keys()));
      }
    });

    // 2. Joining Session / Learning Room
    socket.on('join-room', async ({ roomId, user }) => {
      if (!roomId || !user) return;

      socket.join(roomId);
      socket.currentRoom = roomId;
      socket.userInfo = user;

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }
      const participantsMap = roomParticipants.get(roomId);
      participantsMap.set(socket.id, user);

      // Get list of existing peers in room (excluding this socket)
      const existingPeers = [];
      participantsMap.forEach((u, sId) => {
        if (sId !== socket.id) {
          existingPeers.push({ socketId: sId, user: u });
        }
      });

      // Send existing peers to newly joined participant
      socket.emit('room-peers', existingPeers);

      // Notify others in room that a new peer joined
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        user
      });

      // Fetch recent messages for room
      try {
        const messages = await Message.find({ sessionId: roomId })
          .populate('sender', 'name username avatar')
          .sort({ createdAt: 1 })
          .limit(50);
        socket.emit('initial-messages', messages);
      } catch (err) {
        console.error('Error fetching room messages:', err.message);
      }
    });

    // 3. WebRTC Signaling (1-to-1 or multi-peer)
    socket.on('webrtc-offer', ({ targetSocketId, offer, senderInfo }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        senderSocketId: socket.id,
        offer,
        senderInfo: senderInfo || socket.userInfo
      });
    });

    socket.on('webrtc-answer', ({ targetSocketId, answer, senderInfo }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        senderSocketId: socket.id,
        answer,
        senderInfo: senderInfo || socket.userInfo
      });
    });

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', {
        senderSocketId: socket.id,
        candidate
      });
    });

    socket.on('screen-share-status', ({ roomId, isSharing, userName }) => {
      socket.to(roomId).emit('peer-screen-share', {
        socketId: socket.id,
        isSharing,
        userName
      });
    });

    // 4. Real-time Room Chat
    socket.on('send-message', async ({ roomId, text, fileAttachment }) => {
      if (!roomId || (!text && !fileAttachment)) return;

      try {
        let savedMessage = null;
        if (socket.userInfo?.id || socket.userInfo?._id) {
          const senderId = socket.userInfo.id || socket.userInfo._id;
          savedMessage = await Message.create({
            sessionId: roomId,
            sender: senderId,
            text: text || '',
            fileAttachment: fileAttachment || null
          });
          savedMessage = await Message.findById(savedMessage._id)
            .populate('sender', 'name username avatar');
        }

        const messagePayload = savedMessage || {
          _id: Date.now().toString(),
          sessionId: roomId,
          sender: socket.userInfo || { name: 'Anonymous' },
          text,
          fileAttachment,
          createdAt: new Date().toISOString()
        };

        io.in(roomId).emit('receive-message', messagePayload);
      } catch (err) {
        console.error('Error persisting message:', err.message);
      }
    });

    socket.on('typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('user-typing', { userName });
    });

    socket.on('stop-typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('user-stop-typing', { userName });
    });

    // 5. Collaborative Code Editor
    socket.on('code-change', ({ roomId, code, language }) => {
      // Broadcast to all other participants in the room
      socket.to(roomId).emit('code-sync', {
        code,
        language,
        senderSocketId: socket.id
      });
    });

    socket.on('language-change', ({ roomId, language }) => {
      socket.to(roomId).emit('language-sync', {
        language,
        senderSocketId: socket.id
      });
    });

    socket.on('cursor-change', ({ roomId, position, user }) => {
      socket.to(roomId).emit('cursor-sync', {
        socketId: socket.id,
        position,
        user
      });
    });

    // 6. Collaborative Whiteboard
    socket.on('wb-draw', ({ roomId, elements, action }) => {
      socket.to(roomId).emit('wb-sync', {
        elements,
        action,
        senderSocketId: socket.id
      });
    });

    socket.on('wb-clear', ({ roomId }) => {
      socket.to(roomId).emit('wb-cleared', { senderSocketId: socket.id });
    });

    // 7. Collaborative Notes
    socket.on('notes-update', ({ roomId, notes }) => {
      socket.to(roomId).emit('notes-sync', {
        notes,
        senderSocketId: socket.id
      });
    });

    // 8. Cleanup & Disconnect
    const handleLeaveRoom = () => {
      const roomId = socket.currentRoom;
      if (roomId && roomParticipants.has(roomId)) {
        const participantsMap = roomParticipants.get(roomId);
        participantsMap.delete(socket.id);
        if (participantsMap.size === 0) {
          roomParticipants.delete(roomId);
        }
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          user: socket.userInfo
        });
        socket.leave(roomId);
        socket.currentRoom = null;
      }
    };

    socket.on('leave-room', handleLeaveRoom);

    socket.on('disconnect', () => {
      handleLeaveRoom();
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online-users-updated', Array.from(onlineUsers.keys()));
      }
    });
  });
};
