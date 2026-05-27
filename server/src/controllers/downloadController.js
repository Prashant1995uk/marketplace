import { Note } from '../models/Note.js';
import { User } from '../models/User.js';
import { Purchase } from '../models/Purchase.js';
import { DownloadLog } from '../models/DownloadLog.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import {
  ensureDailyDownloadReset,
  hasDownloadQuota,
  hasUnlimitedDownloads,
  decrementDownloadQuota,
} from '../utils/downloadQuota.js';
import { refreshLeaderboardEntry } from '../services/leaderboardService.js';

export const requestDownload = catchAsync(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note || note.status !== 'approved') {
    throw new AppError('Note not found', 404);
  }

  const user = await User.findById(req.user._id);
  const isOwner = note.uploadedBy.toString() === user._id.toString();

  if (note.isPaid && note.price > 0 && !isOwner) {
    const purchased = await Purchase.findOne({
      buyerId: user._id,
      noteId: note._id,
    });
    if (!purchased) {
      throw new AppError(
        'This is a paid note. Purchase it before downloading.',
        402
      );
    }
  }

  if (!isOwner) {
    await ensureDailyDownloadReset(user);
    if (!hasDownloadQuota(user)) {
      throw new AppError(
        'Daily download limit reached. Upgrade to premium for unlimited downloads.',
        403
      );
    }

    note.downloads += 1;
    await note.save();

    user.personalDownloadsCount += 1;
    await user.save();

    if (!hasUnlimitedDownloads(user)) {
      await decrementDownloadQuota(user._id);
    }

    await DownloadLog.create({ userId: user._id, noteId: note._id });
    await refreshLeaderboardEntry(user._id);
    await refreshLeaderboardEntry(note.uploadedBy);
  }

  const fresh = await User.findById(req.user._id);

  res.json({
    success: true,
    downloadUrl: note.fileUrl,
    note: {
      id: note._id,
      title: note.title,
      subject: note.subject,
      semester: note.semester,
    },
    downloadsRemaining: fresh.downloadsRemaining,
  });
});

export const getMyDownloads = catchAsync(async (req, res) => {
  const logs = await DownloadLog.find({ userId: req.user._id })
    .populate('noteId')
    .sort({ createdAt: -1 })
    .limit(200);

  const data = logs
    .filter((l) => l.noteId)
    .map((l) => ({
      downloadedAt: l.createdAt,
      note: l.noteId,
    }));

  res.json({ success: true, data });
});
