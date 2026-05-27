import { Leaderboard } from '../models/Leaderboard.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getLeaderboard = catchAsync(async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const entries = await Leaderboard.find()
    .sort({ score: -1 })
    .limit(limit)
    .populate('userId', 'name email role');

  const data = entries.map((e, i) => ({
    rank: i + 1,
    score: e.score,
    uploads: e.uploads,
    downloads: e.downloads,
    ratings: e.ratings,
    user: e.userId,
  }));

  res.json({ success: true, data });
});
