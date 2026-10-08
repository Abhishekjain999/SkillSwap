import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String, // Room code or session ObjectId string
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    trim: true,
    default: ''
  },
  fileAttachment: {
    name: String,
    url: String,
    size: Number,
    type: String
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

messageSchema.index({ sessionId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
