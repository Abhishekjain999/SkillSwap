import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningContract'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['TEACHER', 'STUDENT'],
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    required: true
  },
  communicationScore: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  reliabilityScore: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

reviewSchema.index({ reviewee: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
