import { Router } from 'express';
import { purchaseNote } from '../controllers/purchaseController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/:noteId', protect, purchaseNote);

export default router;
