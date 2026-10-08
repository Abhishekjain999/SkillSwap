import express from 'express';
import {
  createSession,
  getMySessions,
  getSessionByIdentifier,
  startSession,
  completeSession,
  saveNotes,
  saveCode,
  uploadSessionFile
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/', createSession);
router.get('/', getMySessions);
router.get('/:identifier', getSessionByIdentifier);
router.put('/:id/start', startSession);
router.post('/:id/complete', completeSession);
router.put('/:id/notes', saveNotes);
router.put('/:id/code', saveCode);
router.post('/:id/files', upload.single('file'), uploadSessionFile);

export default router;
