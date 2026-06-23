import mongoose from "mongoose";


const JobSavedSchema = new mongoose.Schema({
    
    jobOfferId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobOffer',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
},{ timestamps: true })


export default mongoose.model('JobSaved',JobSavedSchema) 