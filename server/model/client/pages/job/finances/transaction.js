import mongoose from "mongoose";


const TransactionSchema = new mongoose.Schema({
    
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobOfferId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobOffer',
    },
    type: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true, 
        unique:true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default:'pending'
    },
    
},{ timestamps: true })


export default mongoose.model('Transactions',TransactionSchema) 