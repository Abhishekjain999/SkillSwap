import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Skill } from '../models/Skill.js';
import { Report } from '../models/Report.js';
import { calculateMatchScore } from '../services/matchingService.js';

// @desc Discover users with filters and search
// @route GET /api/users/discover
export const discoverUsers = async (req, res) => {
  try {
    const {
      q,
      skill,
      proficiency,
      day,
      language,
      minRating,
      onlineOnly,
      sortBy = 'match',
      page = 1,
      limit = 20
    } = req.query;

    const query = { status: 'ACTIVE' };

    // Exclude current user if logged in
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { name: regex },
        { username: regex },
        { headline: regex },
        { bio: regex },
        { location: regex },
        { 'skillsTeaching.skill': regex },
        { 'skillsLearning.skill': regex }
      ];
    }

    if (skill) {
      const skillRegex = new RegExp(skill, 'i');
      query['skillsTeaching.skill'] = skillRegex;
    }

    if (proficiency) {
      query['skillsTeaching.proficiency'] = proficiency;
    }

    if (day) {
      query['availability.days'] = day;
    }

    if (language) {
      query['preferences.languages'] = new RegExp(language, 'i');
    }

    if (minRating) {
      query['ratings.teaching'] = { $gte: parseFloat(minRating) };
    }

    if (onlineOnly === 'true') {
      query.isOnline = true;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    let processedUsers = users.map(u => {
      const matchResult = req.user ? calculateMatchScore(req.user, u) : { score: 75, reasons: [] };
      return {
        _id: u._id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        headline: u.headline,
        bio: u.bio,
        location: u.location,
        timezone: u.timezone,
        skillsTeaching: u.skillsTeaching,
        skillsLearning: u.skillsLearning,
        availability: u.availability,
        preferences: u.preferences,
        ratings: u.ratings,
        badges: u.badges,
        isOnline: u.isOnline,
        matchScore: matchResult.score,
        matchBreakdown: matchResult.breakdown,
        matchReasons: matchResult.reasons
      };
    });

    if (sortBy === 'match') {
      processedUsers.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'rating') {
      processedUsers.sort((a, b) => b.ratings.teaching - a.ratings.teaching);
    } else if (sortBy === 'sessions') {
      processedUsers.sort((a, b) => b.ratings.sessionsCompleted - a.ratings.sessionsCompleted);
    }

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users: processedUsers
    });
  } catch (error) {
    console.error('Discover Users Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
};

// @desc Get full user profile by username or id
// @route GET /api/users/:identifier
export const getUserProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    let user;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier);
    } else {
      user = await User.findOne({ username: identifier.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const reviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    let matchData = null;
    if (req.user && req.user._id.toString() !== user._id.toString()) {
      matchData = calculateMatchScore(req.user, user);
    }

    return res.status(200).json({
      success: true,
      user,
      reviews,
      matchData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Global search across users, skills
// @route GET /api/users/search/global
export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, results: { users: [], skills: [] } });
    }

    const regex = new RegExp(q, 'i');

    const [users, skills] = await Promise.all([
      User.find({
        status: 'ACTIVE',
        $or: [{ name: regex }, { username: regex }, { 'skillsTeaching.skill': regex }]
      }).select('name username avatar headline skillsTeaching').limit(6),
      Skill.find({ name: regex }).limit(6)
    ]);

    return res.status(200).json({
      success: true,
      results: {
        users,
        skills
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Report a user
// @route POST /api/users/report
export const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason, details } = req.body;

    if (!reportedUserId || !reason || !details) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reported user ID, reason, and details'
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason,
      details
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our safety moderation team will review it.',
      report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
