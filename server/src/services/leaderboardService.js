import { User } from '../models/User.js';
import { Note } from '../models/Note.js';
import { Leaderboard } from '../models/Leaderboard.js';

/**
 * Composite score: uploads, personal downloads, and rating quality on seller's notes.
 */
export async function refreshLeaderboardEntry(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const notes = await Note.find({ uploadedBy: userId });
  let ratingsComponent = 0;
  for (const n of notes) {
    ratingsComponent += n.averageRating * Math.max(1, n.reviewCount);
  }

  const uploads = user.uploadsCount;
  const downloads = user.personalDownloadsCount;
  const ratings = Math.round(ratingsComponent * 10) / 10;
  const score = uploads * 100 + downloads * 10 + ratings * 5;

  await Leaderboard.findOneAndUpdate(
    { userId },
    {
      userId,
      score,
      uploads,
      downloads,
      ratings: ratingsComponent,
    },
    { upsert: true, new: true }
  );
}
