import express from 'express'
const route = express.Router()
import userAuth from '../../../../controller/userAuth.js';
import Feedback from '../../../../model/client/pages/profile/feedback.js';


// GET all feedback with pagination
route.get('/api/feedback', userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find()
        .populate('userId', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments()
    ]);

    // Add rating breakdown for first page
    let ratingBreakdown = null;
    if (page === 1) {
      const breakdown = await Feedback.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } }
      ]);
      const avgResult = await Feedback.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } }
      ]);
      ratingBreakdown = {
        avg: avgResult[0]?.avg ? Math.round(avgResult[0].avg * 10) / 10 : 0,
        total: avgResult[0]?.total || 0,
        breakdown: [5,4,3,2,1].map(star => ({
          star,
          count: breakdown.find(b => b._id === star)?.count || 0
        }))
      };
    }

    res.status(200).json({
      success: true,
      data: feedbacks,
      ratingBreakdown,
      hasMore: skip + feedbacks.length < total,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// POST create new feedback
route.post('/api/feedback', userAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || !comment?.trim()) {
      return res.status(400).json({ message: 'Rating and comment required' });
    }


    const feedback = await Feedback.findOneAndUpdate(
      { userId },
      { rating, comment },
      { new:true, upsert:true }
    ).populate('userId', 'name image');

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// PATCH like/unlike a feedback
route.patch('/api/feedback/:id/like', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Not found' });

    const alreadyLiked = feedback.likes.includes(userId);
    if (alreadyLiked) {
      feedback.likes.pull(userId);
    } else {
      feedback.likes.push(userId);
    }
    await feedback.save();

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likeCount: feedback.likes.length
    });
  } catch (error) {
    console.log(error,'at review')
    res.status(500).json({ message: 'Failed to like feedback' });
  }
});





export default route