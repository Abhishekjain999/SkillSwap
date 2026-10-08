import express from 'express';
import { getMyContracts, getContractById, toggleContractGoal } from '../controllers/contractController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyContracts);
router.get('/:id', getContractById);
router.put('/:id/goals/:goalId', toggleContractGoal);

export default router;
