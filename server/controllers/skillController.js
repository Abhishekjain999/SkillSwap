import { Skill } from '../models/Skill.js';

// @desc Get all skills or search by category
// @route GET /api/skills
export const getSkills = async (req, res) => {
  try {
    const { category, q } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (q) {
      query.name = new RegExp(q, 'i');
    }

    const skills = await Skill.find(query).sort({ popularity: -1, name: 1 });
    return res.status(200).json({ success: true, skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new skill (or auto-register)
// @route POST /api/skills
export const createSkill = async (req, res) => {
  try {
    const { name, category, description, icon, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const existing = await Skill.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      existing.popularity += 1;
      await existing.save();
      return res.status(200).json({ success: true, skill: existing });
    }

    const skill = await Skill.create({
      name,
      category: category || 'Software & Tech',
      description: description || '',
      icon: icon || 'Sparkles',
      color: color || 'indigo',
      popularity: 1
    });

    return res.status(201).json({ success: true, skill });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
