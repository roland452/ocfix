import mongoose from "mongoose";


const JobOfferSchema = new mongoose.Schema({
    
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    about: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    priceType: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    liked: {
        type: [String],
        default: []
    },
    saves: {
        type: [String],
        default: []
    },
    offersSent: {
        type: [String],
        default: []
    },
    

},{ timestamps: true })


export default mongoose.model('JobOffer',JobOfferSchema) 