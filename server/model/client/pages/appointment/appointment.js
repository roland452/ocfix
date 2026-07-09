import mongoose from "mongoose";


const OffersSchema = new mongoose.Schema({

  jobOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOffer',
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // New Fields
  portfolioLink: {
    type: String,
    default: ""
  },
 
  approved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


export default mongoose.model('Offers', OffersSchema);

