import mongoose from "mongoose";

const ContractSchema = new mongoose.Schema({
    jobOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobOffer' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['escrowed', 'pending_approval', 'disputed', 'released', 'refunded'], 
        default: 'escrowed' 
    },
    
    // NEW: The "Statement" broken into stages/milestones
    milestones: [{
        title: { type: String, required: true },
        description: { type: String, required: true }, // The criteria for "judging"
        amount: { type: Number, required: true },
        status: { 
            type: String, 
            enum: ['pending', 'submitted', 'approved', 'disputed'], 
            default: 'pending' 
        }
    }],

    submissions: [{
        milestoneIndex: { type: Number, default: 0 }, // Links work to Stage 0, 1, 2, etc.
        version: Number,
        notes: String,
        externalLink: String,
        files: [String], 
        submittedAt: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['pending_approval', 'disputed', 'released', 'refunded'], 
            default: 'pending_approval' 
        },
    }],
    workSubmittedAt: Date,
    autoReleaseDate: Date, 
    paymentReference: String, 
}, { timestamps: true });

export default mongoose.model('EscrowContract', ContractSchema);
