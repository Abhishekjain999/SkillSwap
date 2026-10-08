import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'EXCHANGE_REQUEST',
      'REQUEST_ACCEPTED',
      'REQUEST_REJECTED',
      'COUNTER_OFFER',
      'NEW_MESSAGE',
      'UPCOMING_SESSION',
      'SESSION_STARTED',
      'REVIEW_RECEIVED',
      'BADGE_EARNED',
      'MATCH_FOUND',
      'SYSTEM'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
