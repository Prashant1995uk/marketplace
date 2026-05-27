import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    score: { type: Number, default: 0, index: true },
    uploads: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leaderboardSchema.index({ score: -1 });

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
