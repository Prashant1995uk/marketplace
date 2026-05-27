import { Note } from '../models/Note.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { deleteStoredFile } from '../services/storageService.js';
import { refreshLeaderboardEntry } from '../services/leaderboardService.js';

export const listUsers = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password'),
    User.countDocuments(),
  ]);
  res.json({
    success: true,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    data: users,
  });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'premium', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }
  const user = await User.findById(req.params.userId);
  if (!user) throw new AppError('User not found', 404);
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('Cannot change your own role here', 400);
  }

  user.role = role;
  if (role === 'premium') {
    user.isPremium = true;
    if (!user.premiumExpiresAt || user.premiumExpiresAt < new Date()) {
      const e = new Date();
      e.setMonth(e.getMonth() + 1);
      user.premiumExpiresAt = e;
    }
  } else if (role === 'user') {
    user.isPremium = false;
    user.premiumExpiresAt = null;
  }
  await user.save();

  res.json({
    success: true,
    data: {
      id: user._id,
      role: user.role,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
    },
  });
});

export const listPendingNotes = catchAsync(async (req, res) => {
  const notes = await Note.find({ status: 'pending' })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: notes });
});

export const setNoteStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }
  const note = await Note.findById(req.params.noteId);
  if (!note) throw new AppError('Note not found', 404);

  if (status === 'rejected') {
    await deleteStoredFile(note.filePublicId, note.fileUrl);
    await User.findByIdAndUpdate(note.uploadedBy, {
      $inc: { uploadsCount: -1 },
    });
    await note.deleteOne();
    await refreshLeaderboardEntry(note.uploadedBy);
    return res.json({ success: true, message: 'Note rejected and removed' });
  }

  note.status = 'approved';
  await note.save();
  await refreshLeaderboardEntry(note.uploadedBy);
  res.json({ success: true, data: note });
});

export const adminDeleteNote = catchAsync(async (req, res) => {
  const note = await Note.findById(req.params.noteId);
  if (!note) throw new AppError('Note not found', 404);
  await deleteStoredFile(note.filePublicId, note.fileUrl);
  await User.findByIdAndUpdate(note.uploadedBy, {
    $inc: { uploadsCount: -1 },
  });
  await note.deleteOne();
  await refreshLeaderboardEntry(note.uploadedBy);
  res.json({ success: true, message: 'Note deleted' });
});
