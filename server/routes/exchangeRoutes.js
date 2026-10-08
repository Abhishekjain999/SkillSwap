import express from 'express';
import {
  createExchangeRequest,
  getMyExchanges,
  updateExchangeStatus,
  counterOfferExchange
} from '../controllers/exchangeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createExchangeRequest);
router.get('/', getMyExchanges);
router.put('/:id/status', updateExchangeStatus);
router.post('/:id/counter', counterOfferExchange);

export default router;
