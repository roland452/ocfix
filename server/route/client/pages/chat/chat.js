import express from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Chat from '../../../../model/client/pages/chat/chat.js';
import Upload from '../../../../multer.js';
import userAuth from '../../../../controller/userAuth.js';
import EscrowContract from '../../../../model/client/pages/chat/finances/escrow.js';
import Approved from '../../../../model/client/pages/appointment/approved.js';
import { v2 as cloudinary } from 'cloudinary';
import { emitNewMessage, isUserOnline, getIO } from '../../../../socket/index.js';
const router = express.Router()


// 1. POST: Send a message (Text, Voice, or PDF)
router.post('/api/send-chat', userAuth, Upload.single('file'), async (req, res) => {
    const { clientId, text, replyTo } = req.body;
    const sender = req.user.userId;

    try {
        let fileUrl = null;
        let fileType = 'text';

        if (req.file) {
            fileUrl = req.file.path; 
            if (req.file.mimetype.startsWith('audio/')) fileType = 'audio';
            else if (req.file.mimetype === 'application/pdf') fileType = 'pdf';
            else if (req.file.mimetype.startsWith('image/')) fileType = 'image';
        }

        const newMessage = new Chat({
            sender,
            clientId,
            text: text || (fileType === 'audio' ? "Voice Note" : ""),
            fileUrl,
            fileType,
            replyTo: replyTo ? replyTo : null,
            status: 'sent'
        });

        await newMessage.save();
        await newMessage.populate('replyTo', 'text');

        // If the recipient already has this exact chat open, mark as read immediately
        const io = getIO();
        const recipientSockets = io.sockets.adapter.rooms.get(clientId.toString());
        let deliveredAsRead = false;

        if (recipientSockets) {
            for (const socketId of recipientSockets) {
                const s = io.sockets.sockets.get(socketId);
                if (s?.data?.openChatWith === sender) {
                    deliveredAsRead = true;
                    break;
                }
            }
        }

        if (deliveredAsRead) {
            newMessage.status = 'read';
            newMessage.readAt = new Date();
            await newMessage.save();
        } else if (isUserOnline(clientId)) {
            newMessage.status = 'delivered';
            await newMessage.save();
        }

        // Push it to the recipient in real time (no-op if they're offline — they'll get it on next fetch)
        emitNewMessage(clientId, newMessage);

        res.status(201).json(newMessage);

    } catch (error) {
        console.error('Error from chat sending...', error);
        res.status(500).json({ error: error.message });
    }
});


// 2. GET: Fetch conversation history for a specific clientId
router.get('/api/get-chats/:clientId', userAuth, async (req, res) => {
    try {
        const userId = req.user.userId
        const otherPersonId = req.params.clientId
        const messages = await Chat.find({
            $or:[
                {sender: userId, clientId:otherPersonId},
                {sender: otherPersonId, clientId:userId},
            ]
        })
        .populate('replyTo','text')
        .sort({createdAt: 1})
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 3. GET: Fetch all conversations (with filter support)
router.get('/api/get-chats', userAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { filter, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Base query — user must be involved
        let query = {
            $or: [{ approvedBy: userId }, { clientId: userId }]
        };

        // FIX: handle unhired properly — isHired may not exist on older docs
        if (filter === 'hired') {
            query.isHired = true;
        } else if (filter === 'unhired') {
            query.$and = [
                { $or: [{ approvedBy: userId }, { clientId: userId }] },
                { $or: [{ isHired: false }, { isHired: { $exists: false } }] }
            ];
            delete query.$or; // remove old $or since we moved it into $and
        }

        const chatWindow = await Approved.find(query)
            .populate({ path: 'clientId', select: 'name image' })
            .populate({ path: 'approvedBy', select: 'name image' })
            .populate({ path: 'jobOfferId', select: 'description price' })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // FIX: safely attach escrow data — handle null jobOfferId and approvedBy 
        const chatsWithEscrow = await Promise.all(chatWindow.map(async (chat) => {
            // FIX: don't crash if jobOfferId is null
            const escrow = chat.jobOfferId ? await EscrowContract.findOne({ 
                jobOfferId: chat.jobOfferId._id 
            }, { submissions: 0 }) : null;

            return {
                ...chat._doc,
                escrowStatus: escrow ? escrow.status : 'none',
                contract: escrow || null,
                // FIX: use optional chaining so null approvedBy doesn't crash
                userType: chat.approvedBy?._id?.toString() === userId 
                    ? 'poster' 
                    : 'developer'
            };
        }));

        res.status(200).json(chatsWithEscrow);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: error.message });
    }
});


// 4. DELETE: Remove message and delete the file from Cloudinary
router.delete('/api/delete-chat/:id', userAuth, async (req, res) => {
    try {
        const message = await Chat.findById(req.params.id);
        
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.fileUrl) {
            const publicId = message.fileUrl.split('/').pop().split('.')[0]; 
            await cloudinary.uploader.destroy(publicId);
        }

        await Chat.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Message and cloud file deleted" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


// 5. GET: Unread message count per conversation (for chat list badges)
router.get('/api/chats/unread-counts', userAuth, async (req, res) => {
    try {
        const userId = req.user.userId;

        const counts = await Chat.aggregate([
            { $match: { clientId: new mongoose.Types.ObjectId(userId), status: { $ne: 'read' } } },
            { $group: { _id: '$sender', count: { $sum: 1 } } },
        ]);

        const result = {};
        counts.forEach((c) => { result[c._id.toString()] = c.count; });

        res.status(200).json(result);
    } catch (error) {
        console.error('unread-counts error:', error);
        res.status(500).json({ error: error.message });
    }
});


// 6. PATCH: Mark a conversation as read (REST fallback if socket event missed)
router.patch('/api/chats/:otherUserId/read', userAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otherUserId } = req.params;

        await Chat.updateMany(
            { sender: otherUserId, clientId: userId, status: { $ne: 'read' } },
            { $set: { status: 'read', readAt: new Date() } }
        );

        const io = getIO();
        io.to(otherUserId).emit('messages-read', { by: userId });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('mark-read error:', error);
        res.status(500).json({ error: error.message });
    }
});


// 7. GET: Online status for a specific user (REST fallback)
router.get('/api/chats/online-status/:userId', userAuth, async (req, res) => {
    const { userId } = req.params;
    res.status(200).json({ online: isUserOnline(userId) });
});


export default router;






