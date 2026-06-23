import mongoose from "mongoose";

const LoginHistorySchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    deviceName: String,
    browser: String,
    os: String,
    ipAddress: String,
    location: String,
    status: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('LoginHistory', LoginHistorySchema);
