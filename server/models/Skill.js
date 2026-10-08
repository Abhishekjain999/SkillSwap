import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    enum: [
      'Software & Tech',
      'Design & Creative',
      'Data & AI',
      'Languages & Culture',
      'Business & Finance',
      'Music & Audio',
      'Video & Animation',
      'Writing & Marketing',
      'Personal Development'
    ],
    default: 'Software & Tech'
  },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Code' },
  color: { type: String, default: 'blue' },
  popularity: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Skill = mongoose.model('Skill', skillSchema);
