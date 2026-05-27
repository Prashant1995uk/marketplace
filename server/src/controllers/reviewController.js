import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Note } from '../models/Note.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { refreshLeaderboardEntry } from '../services/leaderboardService.js';

async function recalcNoteRating(noteId) {
  const nid = new mongoose.Types.ObjectId(noteId);
  const agg = await Review.aggregate([
    { $match: { noteId: nid } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);
  const avg = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
  const count = agg[0]?.count || 0;
  const note = await Note.findByIdAndUpdate(
    noteId,
    { averageRating: avg, reviewCount: count },
    { new: true }
  );
  if (note) {
    await refreshLeaderboardEntry(note.uploadedBy);
  }
  return note;
}

export const listReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ noteId: req.params.noteId })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

export const upsertReview = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;
  const note = await Note.findById(req.params.noteId);
  if (!note || note.status !== 'approved') {
    throw new AppError('Note not found', 404);
  }
  if (note.uploadedBy.toString() === req.user._id.toString()) {
    throw new AppError('You cannot review your own note', 400);
  }

  const review = await Review.findOneAndUpdate(
    { userId: req.user._id, noteId: note._id },
    {
      userId: req.user._id,
      noteId: note._id,
      rating: Number(rating),
      comment: comment || '',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await recalcNoteRating(note._id);

  res.json({ success: true, data: review });
});

export const deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    userId: req.user._id,
  });
  if (!review) throw new AppError('Review not found', 404);
  const noteId = review.noteId;
  await review.deleteOne();
  await recalcNoteRating(noteId);
  res.json({ success: true, message: 'Review removed' });
});
