import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  likes: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model('Feedback', FeedbackSchema);

