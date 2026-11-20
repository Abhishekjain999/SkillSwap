import express from 'express';
import rateLimit from 'express-rate-limit';
import { executeCode, getSupportedLanguages } from '../controllers/codeController.js';
import { protectOptional } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for code execution: 30 requests per minute per IP
const executionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 executions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many code execution requests from this IP. Please wait a moment before trying again.',
  },
});

// List supported languages and execution limits
router.get('/languages', getSupportedLanguages);

// Execute code in isolated Docker environment
router.post('/execute', executionRateLimiter, protectOptional, executeCode);

export default router;
