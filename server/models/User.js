import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillTeachingSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  yearsExperience: { type: Number, default: 1 },
  description: { type: String, default: '' },
  rating: { type: Number, default: 5.0, min: 1, max: 5 }
}, { _id: true });

const skillLearningSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true },
  targetProficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High'
  },
  notes: { type: String, default: '' }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  headline: { type: String, default: 'Passionate Skill Exchanger' },
  bio: { type: String, default: '' },
  location: { type: String, default: 'Remote / Global' },
  timezone: { type: String, default: 'UTC+05:30' },
  
  skillsTeaching: [skillTeachingSchema],
  skillsLearning: [skillLearningSchema],

  availability: {
    days: [{ type: String }],
    timeSlots: [{ type: String }],
    hoursPerWeek: { type: Number, default: 4 },
    timezone: { type: String, default: 'UTC+05:30' }
  },

  preferences: {
    sessionType: { type: [String], default: ['One-to-one'] },
    format: { type: [String], default: ['Video', 'Chat'] },
    pacing: { type: String, default: 'Project-based' },
    sessionLength: { type: String, default: '60 minutes' },
    languages: { type: [String], default: ['English'] }
  },

  ratings: {
    teaching: { type: Number, default: 5.0 },
    learning: { type: Number, default: 5.0 },
    reliability: { type: Number, default: 98 }, // %
    responseRate: { type: Number, default: 95 }, // %
    sessionsCompleted: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 }
  },

  streakDays: { type: Number, default: 3 },
  level: { type: Number, default: 1 },

  badges: [{
    id: { type: String },
    name: { type: String },
    icon: { type: String },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }],

  portfolio: [{
    title: { type: String },
    url: { type: String },
    description: { type: String }
  }],

  certificates: [{
    title: { type: String },
    issuer: { type: String },
    year: { type: Number }
  }],

  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },

  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },

  onboardingCompleted: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

userSchema.index({ 'skillsTeaching.skill': 1 });
userSchema.index({ 'skillsLearning.skill': 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
