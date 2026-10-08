import { User } from '../models/User.js';
import { calculateMatchScore } from '../services/matchingService.js';

// @desc Get recommended matches for logged-in user
// @route GET /api/matches
export const getRecommendedMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const potentialMatches = await User.find({
      _id: { $ne: currentUser._id },
      status: 'ACTIVE'
    }).limit(50);

    const scoredMatches = potentialMatches.map(user => {
      const matchResult = calculateMatchScore(currentUser, user);
      return {
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          headline: user.headline,
          location: user.location,
          ratings: user.ratings,
          skillsTeaching: user.skillsTeaching,
          skillsLearning: user.skillsLearning,
          isOnline: user.isOnline,
          badges: user.badges
        },
        matchScore: matchResult.score,
        breakdown: matchResult.breakdown,
        reasons: matchResult.reasons,
        matchedExchangePair: matchResult.matchedExchangePair
      };
    });

    // Sort descending by match score
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      matches: scoredMatches.slice(0, 15)
    });
  } catch (error) {
    console.error('Matching Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error generating recommendations'
    });
  }
};

// @desc Get match details with specific target user
// @route GET /api/matches/:targetUserId
export const getMatchWithUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.targetUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    const matchResult = calculateMatchScore(currentUser, targetUser);

    return res.status(200).json({
      success: true,
      matchResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
