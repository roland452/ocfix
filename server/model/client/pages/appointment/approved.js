import mongoose from "mongoose";


const ApprovedSchema = new mongoose.Schema({
    
    jobOfferId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobOffer',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isHired: {
        type: Boolean,
        default: false
    }
    
},{ timestamps: true })


export default mongoose.model('Approved',ApprovedSchema) 