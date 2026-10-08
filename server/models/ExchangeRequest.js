import mongoose from 'mongoose';

const counterOfferSchema = new mongoose.Schema({
  skillToTeach: { type: String },
  skillToLearn: { type: String },
  sessions: { type: Number },
  durationMinutes: { type: Number },
  schedule: { type: String },
  goals: [{ type: String }],
  message: { type: String },
  counteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  counteredAt: { type: Date, default: Date.now }
}, { _id: false });

const exchangeRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teachingSkill: {
    type: String,
    required: true
  },
  learningSkill: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  proposedSessions: {
    type: Number,
    default: 4
  },
  proposedDurationMinutes: {
    type: Number,
    default: 60
  },
  learningGoals: [{
    type: String
  }],
  status: {
    type: String,
    enum: [
      'PENDING',
      'ACCEPTED',
      'REJECTED',
      'COUNTERED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    ],
    default: 'PENDING'
  },
  counterOffer: counterOfferSchema,
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdContract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningContract'
  }
}, {
  timestamps: true
});

exchangeRequestSchema.index({ sender: 1, receiver: 1 });
exchangeRequestSchema.index({ status: 1 });

export const ExchangeRequest = mongoose.model('ExchangeRequest', exchangeRequestSchema);
