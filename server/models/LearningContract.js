import mongoose from 'mongoose';

const goalItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

const learningContractSchema = new mongoose.Schema({
  exchangeRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExchangeRequest',
    required: true
  },
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillA: {
    type: String,
    required: true
  },
  skillB: {
    type: String,
    required: true
  },
  totalSessions: {
    type: Number,
    default: 6
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  sessionDurationMinutes: {
    type: Number,
    default: 60
  },
  goals: [goalItemSchema],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'TERMINATED'],
    default: 'ACTIVE'
  },
  agreementTerms: {
    type: String,
    default: 'Both parties agree to uphold mutual respect, timely attendance, and productive collaborative learning sessions on SkillSwap.'
  }
}, {
  timestamps: true
});

learningContractSchema.index({ userA: 1, userB: 1 });
learningContractSchema.index({ status: 1 });

export const LearningContract = mongoose.model('LearningContract', learningContractSchema);
