import { Router } from 'express';
import { body } from 'express-validator';
import {
  listUsers,
  updateUserRole,
  listPendingNotes,
  setNoteStatus,
  adminDeleteNote,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/users', listUsers);
router.patch(
  '/users/:userId/role',
  [body('role').isIn(['user', 'premium', 'admin'])],
  validate,
  updateUserRole
);

router.get('/notes/pending', listPendingNotes);
router.patch(
  '/notes/:noteId/status',
  [body('status').isIn(['approved', 'rejected'])],
  validate,
  setNoteStatus
);
router.delete('/notes/:noteId', adminDeleteNote);

export default router;
