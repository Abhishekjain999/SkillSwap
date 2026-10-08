import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: [
      'Inappropriate Behavior',
      'No-show / Abandoned Session',
      'Spam or Solicitation',
      'Harassment',
      'Skill Misrepresentation',
      'Other'
    ],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
    default: 'PENDING'
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  actionTaken: {
    type: String,
    enum: ['NONE', 'WARNED', 'SUSPENDED'],
    default: 'NONE'
  }
}, {
  timestamps: true
});

reportSchema.index({ status: 1 });

export const Report = mongoose.model('Report', reportSchema);
