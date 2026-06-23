import express from 'express'
import mongoose from 'mongoose'
import Appointment from '../../../../model/client/pages/appointment/appointment.js';
import Review from '../../../../model/client/pages/profile/review.js';
import Approved from '../../../../model/client/pages/appointment/approved.js';
import JobOffer from '../../../../model/client/pages/job/job.js';
import Transaction from '../../../../model/client/pages/job/finances/transaction.js';
import EscrowContract from '../../../../model/client/pages/chat/finances/escrow.js';
import userAuth from '../../../../controller/userAuth.js';
import Chat from '../../../../model/client/pages/chat/chat.js';
const route = express.Router();


route.get('/api/dashboard-stats', userAuth, async (req, res) => {
  const userId = req.user.userId;
  const userObjectId = new mongoose.Types.ObjectId(userId)

  // Developer stats
  const totalOffers = await Approved.countDocuments({ clientId: userObjectId })
  const totalEarnings = await Transaction.aggregate([
    { $match: { receiverId: userObjectId, type: 'milestone_release' }},
    { $group: { _id: null, total: { $sum: '$amount' }}}
  ])
  const monthlyEarnings = await Transaction.aggregate([
    { $match: { 
      receiverId: userObjectId, 
      type: 'milestone_release',
      createdAt: { $gte: new Date(new Date().setDate(1)) } // this month
    }},
    { $group: { _id: null, total: { $sum: '$amount' }}}
  ])

  // Poster stats
  const jobsPosted = await JobOffer.countDocuments({ postedBy: userObjectId })
  const activeContracts = await EscrowContract.countDocuments({ 
    posterId: userObjectId, 
    status: 'escrowed' 
  })
  const totalSpent = await Transaction.aggregate([
    { $match: { senderId: userObjectId, type: 'milestone_release' }},
    { $group: { _id: null, total: { $sum: '$amount' }}}
  ])
  const monthlySpent = await Transaction.aggregate([
    { $match: { 
      senderId: userObjectId, 
      type: 'milestone_release',
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    }},
    { $group: { _id: null, total: { $sum: '$amount' }}}
  ])

  const avgRatingResult = await Review.aggregate([
    {
        $match: { revieweeId: userObjectId }
    },
    {
        $group: {
            _id: null,
            avg: { $avg: '$rating' }
        }
    }
  ])

  const avgRating = avgRatingResult[0]?.avg? Math.round(avgRatingResult[0].avg * 10) / 10 : 0

  res.status(200).json({
    developer: {
      totalOffers,
      totalEarnings: totalEarnings[0]?.total || 0,
      monthlyEarnings: monthlyEarnings[0]?.total || 0,
      avgRating,
    },
    poster: {
      jobsPosted,
      activeContracts,
      totalSpent: totalSpent[0]?.total || 0,
      monthlySpent: monthlySpent[0]?.total || 0,
    }
  })
})



route.get('/api/dashboard/ratings-chart', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Get start of this week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() + mondayOffset);
    thisWeekStart.setHours(0, 0, 0, 0);

    // Get start of last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);

    // Fetch this week's ratings grouped by day
    const ratingsThisWeek = await Review.aggregate([
      {
        $match: {
          revieweeId: userObjectId,
          createdAt: { $gte: thisWeekStart }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' }, // 1=Sun, 2=Mon ... 7=Sat 
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Fetch last week's total for percent change
    const lastWeekRatings = await Review.aggregate([
      {
        $match: {
          revieweeId: userObjectId,
          createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Build chart data for Mon-Sun
    // MongoDB $dayOfWeek: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
    const dayMap = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 1: 6 };

    const chartData = days.map((day, index) => ({ day, value: 0 }));

    ratingsThisWeek.forEach(item => {
      const chartIndex = dayMap[item._id];
      if (chartIndex !== undefined) {
        chartData[chartIndex].value = Math.round(item.avgRating * 10) / 10;
      }
    });

    // Calculate percent change
    const thisWeekAvg = ratingsThisWeek.reduce((sum, r) => sum + r.avgRating, 0) / 
                        (ratingsThisWeek.length || 1);
    const lastWeekAvg = lastWeekRatings[0]?.avgRating || 0;

    const percentChange = lastWeekAvg === 0 
      ? 100 
      : Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100);

    res.status(200).json({ chartData, percentChange });

  } catch (error) {
    console.error('Ratings chart error:', error);
    res.status(500).json({ message: 'Failed to fetch ratings chart' });
  }
});




route.get('/api/dashboard/appointment-trends', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { userType } = req.query; // 'freelancer' or 'poster'

    const now = new Date();

    // Last 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Last 60-30 days (for percent change comparison)
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Query based on userType
    // freelancer = clientId in Approved (developer who sent proposal)
    // poster = approvedBy in Approved (client who posted job)
    const matchField = userType === 'freelancer' 
      ? { clientId: userObjectId } 
      : { approvedBy: userObjectId }

    // Fetch this month's appointments grouped by day
    const thisMonthData = await Approved.aggregate([
      {
        $match: {
          ...matchField,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%m/%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Last month count for percent change
    const lastMonthCount = await Approved.countDocuments({
      ...matchField,
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    const thisMonthCount = await Approved.countDocuments({
      ...matchField,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Build full 30 day chart data (fill missing days with 0)
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const label = `${String(date.getMonth() + 1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;
      const found = thisMonthData.find(d => d._id === label);
      chartData.push({ day: label, count: found ? found.count : 0 });
    }

    // Calculate percent change 
    const percentChange = lastMonthCount === 0
      ? 100
      : Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);

    res.status(200).json({ chartData, percentChange });

  } catch (error) {
    console.error('Appointment trends error:', error);
    res.status(500).json({ message: 'Failed to fetch appointment trends' });
  }
});



route.get('/api/dashboard/job-flux', userAuth, async (req, res) => {
  try {
    // Get start of this week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() + mondayOffset);
    thisWeekStart.setHours(0, 0, 0, 0);

    // Get top 5 highest paying FIXED jobs posted this week
    const topJobs = await JobOffer.find({
      createdAt: { $gte: thisWeekStart },
      priceType: 'fixed',   // only fixed price jobs
      price: { $gt: 0 }      // must have a price
    })
    .sort({ price: -1 })     // highest price first
    .limit(5)
    .select('about description price category createdAt');

    // Format for chart — rank 1 to 5, amount is the price
    const chartData = topJobs.map((job, index) => ({
      rank: index + 1,
      amount: job.price,
      title: job.about || job.description?.slice(0, 30) || 'Untitled Job',
      category: job.category
    }));

    // If less than 5 jobs this week pad with zeros so chart renders
    while (chartData.length < 5) {
      chartData.push({
        rank: chartData.length + 1,
        amount: 0,
        title: 'No job',
        category: ''
      });
    }

    res.status(200).json(chartData);

  } catch (error) {
    console.error('Job flux error:', error);
    res.status(500).json({ message: 'Failed to fetch job flux' });
  }
});


route.get('/api/dashboard/top-earners', userAuth, async (req, res) => {
  try {
    // Get start of this week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() + mondayOffset);
    thisWeekStart.setHours(0, 0, 0, 0);

    // Aggregate transactions this week grouped by receiver (developer)
    const topEarners = await Transaction.aggregate([
      {
        $match: {
          type: 'milestone_release',
          status: 'success',
          createdAt: { $gte: thisWeekStart }
        }
      },
      {
        $group: {
          _id: '$receiverId',         // group by developer
          totalEarned: { $sum: '$amount' },
          jobCount: { $addToSet: '$jobOfferId' }, // unique jobs
          latestJob: { $last: '$jobOfferId' }
        }
      },
      {
        $sort: { totalEarned: -1 }    // highest earner first
      },
      {
        $limit: 5                     // top 5 only
      },
      {
        // Join with users collection to get name and image
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        // Join with joboffers to get job title
        $lookup: {
          from: 'joboffers',
          localField: 'latestJob',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $unwind: { path: '$job', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          totalEarned: 1,
          jobCount: { $size: '$jobCount' },
          name: '$user.name',
          image: '$user.image',
          jobTitle: { $ifNull: ['$job.about', 'Freelance Developer'] }
        }
      }
    ]);

    res.status(200).json(topEarners);

  } catch (error) {
    console.error('Top earners error:', error);
    res.status(500).json({ message: 'Failed to fetch top earners' });
  }
});



route.get('/api/dashboard/activity-feed', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Someone sent you a proposal
    const proposals = await Appointment.find({ postedBy: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sentBy', 'name image')
      .lean();

    // 2. Someone hired you
    const hires = await Approved.find({ clientId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('approvedBy', 'name image')
      .lean();

    // 3. Milestone released (payment received)
    const milestones = await Transaction.find({
      receiverId: userObjectId,
      type: 'milestone_release',
      status: 'success'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('senderId', 'name image')
      .lean();

    // 4. New review received
    const reviews = await Review.find({ revieweeId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reviewerId', 'name image')
      .lean();

    // 5. New message received
    const messages = await Chat.find({ clientId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'name image')
      .lean();

    // Normalize each into a common shape
    const normalize = (items, type) => items.map(item => {
      const map = {
        proposal:  { user: item.sentBy?.name,      image: item.sentBy?.image,      action: 'sent you a proposal',         time: item.createdAt },
        hired:     { user: item.approvedBy?.name,   image: item.approvedBy?.image,  action: 'hired you for a job',          time: item.createdAt },
        milestone: { user: item.senderId?.name,     image: item.senderId?.image,    action: `released ₦${item.amount?.toLocaleString()} milestone payment`, time: item.createdAt },
        review:    { user: item.reviewerId?.name,   image: item.reviewerId?.image,  action: `left you a ${item.rating}⭐ review`, time: item.createdAt },
        message:   { user: item.sender?.name,       image: item.sender?.image,      action: 'sent you a new message',      time: item.createdAt },
      };
      return { id: item._id, type, ...map[type] };
    });

    // Combine all, sort by most recent, limit to 10
    const feed = [
      ...normalize(proposals,  'proposal'),
      ...normalize(hires,      'hired'),
      ...normalize(milestones, 'milestone'),
      ...normalize(reviews,    'review'),
      ...normalize(messages,   'message'),
    ]
      .filter(item => item.user) // drop any with missing populated user
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    res.status(200).json(feed);

  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ message: 'Failed to fetch activity feed' });
  }
});


export default route;


