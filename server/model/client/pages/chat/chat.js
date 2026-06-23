import mongoose from 'mongoose';
const ChatSchema = new mongoose.Schema({
  
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 

  text: { type: String, default: "" }, 
  fileUrl: { type: String, default: null }, 
  fileType: {
    type: String,
    enum: ['text', 'image', 'pdf', 'audio'],
    default: 'text'
  },

  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },

  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  readAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Chat', ChatSchema);