import express from 'express';
import { discoverUsers, getUserProfile, globalSearch, reportUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Optional auth helper to check if req has token
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/discover', optionalAuth, discoverUsers);
router.get('/search/global', globalSearch);
router.get('/:identifier', optionalAuth, getUserProfile);
router.post('/report', protect, reportUser);

export default router;
