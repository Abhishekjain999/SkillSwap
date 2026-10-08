import express from 'express';
import { getRecommendedMatches, getMatchWithUser } from '../controllers/matchingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getRecommendedMatches);
router.get('/:targetUserId', protect, getMatchWithUser);

export default router;
