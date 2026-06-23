import express from 'express';
import Review from '../../../../model/client/pages/profile/review.js';
import userAuth from '../../../../controller/userAuth.js';
const route = express.Router();




// Updated route to ensure one review per user per client
route.post('/api/user/review', userAuth, async (req, res) => {
  const { revieweeId, rating, comment } = req.body;
  const reviewerId = req.user.userId;

  try {
    // findOneAndUpdate with upsert: true handles the "once only" logic
    await Review.findOneAndUpdate(
      { revieweeId, reviewerId }, 
      { rating, comment }, 
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Review updated successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process review' });
  }
});

// New route to delete a review
route.delete('/api/user/review/:reviewId', userAuth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      reviewerId: req.user.userId // Ensures only the author can delete it
    });

    if (!review) return res.status(404).json({ message: 'Review not found or unauthorized' });
    
    res.status(200).json({ message: 'Review deleted', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review' });
  }
});




// Route to fetch reviews for a specific user
route.get('/api/user/reviews/:id', userAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.id })
      .populate('reviewerId', 'name image')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ data: reviews, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});



export default route;