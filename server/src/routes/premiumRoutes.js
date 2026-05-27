import { Router } from 'express';
import { subscribePremium } from '../controllers/premiumController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/subscribe', protect, subscribePremium);

export default router;
