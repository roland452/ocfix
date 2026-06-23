import express from 'express';
import mongoose from 'mongoose';
import userAuth from '../../../../controller/userAuth.js';
import Approved from '../../../../model/client/pages/appointment/approved.js';
import Transaction from '../../../../model/client/pages/job/finances/transaction.js';
import Review from '../../../../model/client/pages/profile/review.js';
import Chat from '../../../../model/client/pages/chat/chat.js';

const route = express.Router();

// GET all notices for logged in user
// Combines activity from multiple collections into one feed
route.get('/api/notices', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const notices = [];

    // 1. New proposals received (someone sent you a notice on your job)
    const proposals = await Approved.find({ approvedBy: userObjectId })
      .populate('clientId', 'name image')
      .populate('jobOfferId', 'description')
      .sort({ createdAt: -1 })
      .limit(10);

    proposals.forEach(p => {
      notices.push({
        _id: `proposal_${p._id}`,
        type: 'proposal',
        title: `${p.clientId?.name} sent a proposal`,
        message: `You received a new proposal for "${p.jobOfferId?.description || 'your job'}". Review and respond.`,
        status: 'seen',
        refId: p.clientId?._id,
        meta: null,
        createdAt: p.createdAt
      });
    });

    // 2. Got hired (you were approved as developer)
    const hired = await Approved.find({ clientId: userObjectId, isHired: true })
      .populate('approvedBy', 'name image')
      .populate('jobOfferId', 'description')
      .sort({ createdAt: -1 })
      .limit(10);

    hired.forEach(h => {
      notices.push({
        _id: `hired_${h._id}`,
        type: 'hired',
        title: `You got hired by ${h.approvedBy?.name}`,
        message: `Congratulations! ${h.approvedBy?.name} hired you for "${h.jobOfferId?.description || 'a project'}". Open chat to get started.`,
        status: 'seen',
        refId: h.approvedBy?._id,
        meta: null,
        createdAt: h.updatedAt
      });
    });

    // 3. Payments received (milestone releases)
    const payments = await Transaction.find({
      receiverId: userObjectId,
      type: 'milestone_release',
      status: 'success'
    })
      .populate('senderId', 'name')
      .populate('jobOfferId', 'description')
      .sort({ createdAt: -1 })
      .limit(10);

    payments.forEach(p => {
      notices.push({
        _id: `payment_${p._id}`,
        type: 'payment',
        title: `₦${p.amount?.toLocaleString()} received`,
        message: `${p.senderId?.name} released milestone payment for "${p.jobOfferId?.description || 'a project'}".`,
        status: 'seen',
        refId: null,
        meta: {
          amount: p.amount,
          jobTitle: p.jobOfferId?.description,
          reference: p.reference
        },
        createdAt: p.createdAt
      });
    });

    // 4. New reviews received
    const reviews = await Review.find({ revieweeId: userObjectId })
      .populate('reviewerId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    reviews.forEach(r => {
      notices.push({
        _id: `review_${r._id}`,
        type: 'review',
        title: `${r.reviewerId?.name} left you a review`,
        message: `You received a ${r.rating}-star review. Tap to see what they said.`,
        status: 'seen',
        refId: null,
        meta: {
          rating: r.rating,
          comment: r.comment,
          reviewerName: r.reviewerId?.name
        },
        createdAt: r.createdAt
      });
    });

    // 5. New messages (last message from each conversation)
    const messages = await Chat.find({ clientId: userObjectId })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    messages.forEach(m => {
      if (m.sender?._id?.toString() !== userId) {
        notices.push({
          _id: `message_${m._id}`,
          type: 'message',
          title: `New message from ${m.sender?.name}`,
          message: m.fileType !== 'text' ? `Sent you a ${m.fileType}` : m.text?.slice(0, 60) || 'New message',
          status: 'seen',
          refId: m.clientId,
          meta: null,
          createdAt: m.createdAt
        });
      }
    });

    // Sort all notices by date newest first
    notices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, data: notices });

  } catch (error) {
    console.error('Notices error:', error);
    res.status(500).json({ message: 'Failed to fetch notices' });
  }
});

// PATCH mark all as read — no DB needed since we compute notices from other collections
// Just return success (status is always 'seen' for now since we don't store separate read state)
route.patch('/api/notices/mark-all-read', userAuth, async (req, res) => {
  res.status(200).json({ success: true });
});

// PATCH mark one as read
route.patch('/api/notices/:id/read', userAuth, async (req, res) => {
  res.status(200).json({ success: true });
});

export default route;