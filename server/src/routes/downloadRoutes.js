import { Router } from 'express';
import { requestDownload, getMyDownloads } from '../controllers/downloadController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/mine', protect, getMyDownloads);
router.post('/:id', protect, requestDownload);

export default router;
