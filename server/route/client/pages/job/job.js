import express from 'express'
import userAuth from '../../../../controller/userAuth.js'
import JobOffer from '../../../../model/client/pages/job/job.js'
import Review from '../../../../model/client/pages/profile/review.js'
import User from '../../../../model/client/pages/profile/user.js'
import JobSaved from '../../../../model/client/pages/job/jobSaved.js'
const route = express.Router()






// route for fetching all job offers with pagination
route.get('/api/joboffer', userAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6; 
        const skip = (page - 1) * limit;

        const jobs = await JobOffer.find()
            .populate('postedBy', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalJobs = await JobOffer.countDocuments();
        const totalPages = Math.ceil(totalJobs / limit);

        // FIX: add avg rating for each job poster
        const jobsWithRating = await Promise.all(jobs.map(async (job) => {
            const ratingResult = await Review.aggregate([
                { $match: { revieweeId: job.postedBy._id } },
                { $group: { _id: null, avg: { $avg: '$rating' } } }
            ]);

            return {
                ...job._doc,
                postedBy: {
                    ...job.postedBy._doc,
                    avgRating: ratingResult[0]?.avg 
                        ? Math.round(ratingResult[0].avg * 10) / 10 
                        : null
                }
            };
        }));

        res.status(200).json({ 
            data: jobsWithRating,  // ← use jobsWithRating not jobs
            currentPage: page,
            totalPages,
            totalJobs,
            success: true 
        });
        
    } catch (error) {
        console.error("Pagination Error:", error);
        res.status(500).json({ message: 'failed to fetch paginated jobs' });
    }
});


// New route to fetch specific client details for the modal
route.get('/api/user/details/:id', userAuth, async (req, res) => {
    try {
        // Find user and select only the fields you want to show in the modal
        const user = await User.findById(req.params.id).select('name image email phone about');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.status(200).json({ data: user, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error);
        
    }
});





// route for fetching user job offer history
route.get('/api/joboffer/history', userAuth, async(req, res) => {
   console.log(req.user.userId);
   
    try {
        const jobs = await JobOffer.find({ postedBy: req.user.userId }).sort({ createdAt:-1 })

        res.status(200).json({ data: jobs, message:'getting updating', success: true })
        
    } catch (error) {
        res.status(500).json({message:'failed'})
    }
})



// route for fetching saved jobs offer
route.get('/api/joboffer/save', userAuth, async(req, res) => {
    try {
        const jobs = await JobSaved.find({ userId: req.user.userId }).populate({ 
          path:'jobOfferId', 
          populate: {
            path:'postedBy',
            select:'name image'
          }
        }).sort({ createdAt:-1 })

        res.status(200).json({ data: jobs, message:'getting updating', success: true })
        
    } catch (error) {
        res.status(500).json({message:'failed'})
    }
})






// route for posting job offer
route.post('/api/joboffer', userAuth, async(req, res) => {

    const { description, about, tags, category, priceType, price, } = req.body
    if(!description || !about || !tags) return res.status(400).json({ message:'all inputs must be filled', success: false })

    try {

        const newJobOffer = new JobOffer({ description, about, tags, category, priceType, price, postedBy: req.user.userId })

        await newJobOffer.save()

        return res.status(200).json({ message:'your job offer has been created successfully', success: false })

    } catch (error) {
        
        res.status(500).json({message:'failed'})
        console.log(error)
    }
})


// route for posting reactions for jobOffers
route.patch('/api/joboffer/reaction', userAuth, async(req, res) => {
    const { jobOfferId } = req.body;
    const userId = req.user.userId
    
    
    try {
        const jobOffer = await JobOffer.findById(jobOfferId)
        if(!jobOffer) return res.status(401).json({message: 'job offer doesnt exist', success: false})

        const isLiked = jobOffer.liked.includes(userId)

        const update = isLiked? { $pull: { liked:userId } } : { $addToSet: { liked: userId } }

        const updatedJobOffer = await JobOffer.findByIdAndUpdate(jobOfferId, update, { new: true })

        return res.status(200).json({ message:'reaction posted', data:updatedJobOffer, success: false })
        
    } catch (error) {
        res.status(500).json({message:'failed'})
        console.log(error)
    }
})








// route for saving job offer to for users
route.post('/api/joboffer/save', userAuth, async (req, res) => {

  const { jobOfferId } = req.body;
  const userId = req.user.userId; 
  try {
    

    // 1. Check if this SPECIFIC user has saved this SPECIFIC job
    const existingSave = await JobSaved.findOne({ 
      jobOfferId: jobOfferId, 
      userId: userId 
    });

    if (existingSave) {
      // 2. TOGGLE OFF: Remove the save document
      await JobSaved.findByIdAndDelete(existingSave._id);

      // Also update the main JobOffer array so the icon changes
      const updatedJob = await JobOffer.findByIdAndUpdate(
        jobOfferId,
        { $pull: {saves: userId } },
        { new: true }
      );

      return res.status(200).json({ message: 'Job unsaved', data: updatedJob });
    } else {
      // 3. TOGGLE ON: Create new save document
      const newSave = new JobSaved({ jobOfferId, userId });
      await newSave.save();

      // Update the main JobOffer array
      const updatedJob = await JobOffer.findByIdAndUpdate(
        jobOfferId,
        { $addToSet: { saves: userId } },
        { new: true }
      );

      return res.status(200).json({ message: 'Job saved', data: updatedJob });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'failed' });
  }
});


export default route