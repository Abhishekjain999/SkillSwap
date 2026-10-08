import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningContract'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillTaught: {
    type: String,
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  durationMinutes: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED'
  },
  roomCode: {
    type: String,
    required: true,
    unique: true
  },
  notes: {
    type: String,
    default: '# Session Notes\n\n- Key Concepts:\n- Questions & Discussion:\n- Action Items & Homework:\n'
  },
  codeEditorState: {
    language: { type: String, default: 'javascript' },
    code: {
      type: String,
      default: '// Welcome to the SkillSwap Collaborative Code Room!\nfunction solution() {\n  console.log("Hello from SkillSwap!");\n}\n\nsolution();\n'
    }
  },
  whiteboardState: {
    type: String,
    default: '[]'
  },
  sharedFiles: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, default: 0 },
    type: { type: String, default: 'application/octet-stream' },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  feedback: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['TEACHER', 'STUDENT'] },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    whatLearned: { type: String },
    whatTaught: { type: String },
    goalsCompleted: [{ type: String }],
    submittedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

sessionSchema.index({ participants: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ scheduledStartTime: 1 });

export const Session = mongoose.model('Session', sessionSchema);
