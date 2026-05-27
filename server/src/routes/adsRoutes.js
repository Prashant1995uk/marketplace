import { Router } from 'express';
import { getAdPlaceholder } from '../controllers/adsController.js';

const router = Router();

router.get('/config', getAdPlaceholder);

export default router;
