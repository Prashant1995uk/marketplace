import { User } from '../models/User.js';
import { Leaderboard } from '../models/Leaderboard.js';
import { catchAsync } from '../utils/catchAsync.js';
import { refreshLeaderboardEntry } from '../services/leaderboardService.js';

export const getDashboard = catchAsync(async (req, res) => {
  await refreshLeaderboardEntry(req.user._id);
  const user = await User.findById(req.user._id).select('-password');

  const rankAgg = await Leaderboard.aggregate([
    { $sort: { score: -1 } },
    {
      $group: {
        _id: null,
        ordered: { $push: '$userId' },
      },
    },
  ]);

  let rank = null;
  if (rankAgg[0]?.ordered) {
    const idx = rankAgg[0].ordered.findIndex(
      (id) => id.toString() === user._id.toString()
    );
    rank = idx === -1 ? null : idx + 1;
  }

  res.json({
    success: true,
    profile: user,
    leaderboardRank: rank,
  });
});
