import express from 'express';
import {
  getAdminStats,
  getAllUsersAdmin,
  toggleUserStatus,
  getAdminReports,
  resolveReport
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsersAdmin);
router.put('/users/:id/status', toggleUserStatus);
router.get('/reports', getAdminReports);
router.put('/reports/:id', resolveReport);

export default router;
