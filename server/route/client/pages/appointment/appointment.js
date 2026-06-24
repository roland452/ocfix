import express from 'express'
import userAuth from '../../../../controller/userAuth.js'
import JobOffer from '../../../../model/client/pages/job/job.js'
import Offers from '../../../../model/client/pages/appointment/appointment.js'
import User from '../../../../model/client/pages/profile/user.js'
import Approved from '../../../../model/client/pages/appointment/approved.js'
import Upload from '../../../../multer.js'
const route = express.Router()


route.get('/api/offers', userAuth, async(req, res) => {
  try {
    const offers = await Offers.find({ postedBy: req.user.userId }).populate({
      path:'jobOfferId',
      select:'description about'
    }).populate({        
      path:'sentBy',
      select:'image name profession email'
    }).sort({ createdAt:-1 })

    res.status(200).json({ data: offers, success: true})

  } catch (error) {
    res.status(500).json({ message: 'failed to get offers '})
  }
})


// Route to get a specific user's public profile data
route.get('/api/user/profile/:id', userAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user and select only the fields needed for the profile modal
    // Exclude sensitive data like password
    const user = await User.findById(userId).select('name email image phone about');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile' 
    });
  }
});




// route for sending/unsending job offers with images and links
route.post('/api/sendoffer', Upload.array('projects', 3), userAuth, async (req, res) => {
  const { jobOfferId, postedBy, portfolioLink } = req.body;
  const sentBy = req.user.userId;

  if (postedBy === sentBy) {
    return res.status(402).json({ message: "You cannot send an offer to your own job" });
  }

  try {
    // 1. Check if this SPECIFIC user has already sent a notice for this job
    const existingSave = await Offers.findOne({
      jobOfferId: jobOfferId,
      sentBy: sentBy
    });

    if (existingSave) {
      // 2. TOGGLE OFF: If it exists, remove the offer (Unsend Notice)
      await Offers.findByIdAndDelete(existingSave._id);

      await JobOffer.findByIdAndUpdate(jobOfferId, {
        $pull: { offersSent: sentBy }
      });

      return res.status(200).json({ message: 'offer unsent', success: true });
    }

    // 3. TOGGLE ON: Create new offer with images and portfolio link
    // Extract paths from the files uploaded by Multer
    const projectPaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];

    const newOffer = new Offers({
      jobOfferId,
      postedBy,
      sentBy,
      portfolioLink: portfolioLink || "",
      projects: projectPaths
    });

    await newOffer.save();

    // Update main JobOffer array to show user has sent an offer
    await JobOffer.findByIdAndUpdate(jobOfferId, {
      $push: { offersSent: sentBy }
    });

    res.status(201).json({ message: 'offer sent successfully', data: newOffer, success: true });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'failed to process offer'});
  }
});






// route for saving approved client 
route.post('/api/post-approval', userAuth, async (req, res) => {
  const { clientId, jobOfferId } = req.body;
  const approvedBy = req.user.userId;
  try {

    const existingSave = await Offers.findOne({ 
      jobOfferId: jobOfferId, 
      postedBy: approvedBy,
      sentBy: clientId
    });

    if(existingSave) {
      const updatedOffer = await Offers.findOneAndDelete({ 
        jobOfferId: jobOfferId, 
        postedBy: approvedBy,
        sentBy: clientId
      }); 

      const approved = new Approved({
        clientId, jobOfferId, approvedBy
      });

      await approved.save();
      res.status(201).json(approved);
    } else{
      res.status(201).json({message: 'failed to approve client'});
    }
    

  } catch (error) {
    res.status(201).json({message: 'server error occured'});
    console.log(error);
    
  }
})


// route for declined approval for appointment client 
route.post('/api/post-decline-approval', userAuth, async (req, res) => {
  const { clientId, jobOfferId } = req.body;
  const approvedBy = req.user.userId;
  try {

    const updatedOffer = await Offers.findOneAndDelete({ 
      jobOfferId: jobOfferId, 
      postedBy: approvedBy,
      sentBy: clientId
    }); 

    await updatedOffer.save()
    res.status(201).json({message: 'offer has been declined and deleted'})

  } catch (error) {
    res.status(201).json({message: 'server error occured'});
    console.log(error);
    
  }
})


export default route