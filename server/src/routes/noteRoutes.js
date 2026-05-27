import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  listNotes,
  getNoteById,
  uploadNote,
  deleteNote,
  getMyUploads,
} from '../controllers/noteController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { uploadPdf } from '../config/multer.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
  ],
  validate,
  listNotes
);

router.get('/mine', protect, getMyUploads);
router.get('/:id', optionalAuth, getNoteById);

router.post(
  '/',
  protect,
  uploadPdf.single('file'),
  [
    body('title').trim().notEmpty(),
    body('subject').trim().notEmpty(),
    body('semester').trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
  ],
  validate,
  uploadNote
);

router.delete('/:id', protect, deleteNote);

export default router;
