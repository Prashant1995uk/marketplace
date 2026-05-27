import { Router } from 'express';
import { summarizeNote } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/summarize/:noteId', protect, summarizeNote);

export default router;
