import { User } from '../models/User.js';

const FREE_LIMIT = () => Number(process.env.FREE_DAILY_DOWNLOAD_LIMIT) || 5;

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function hasUnlimitedDownloads(user) {
  return (
    user.role === 'admin' ||
    user.role === 'premium' ||
    (user.isPremium &&
      user.premiumExpiresAt &&
      user.premiumExpiresAt > new Date())
  );
}

export async function ensureDailyDownloadReset(user) {
  const today = startOfToday();
  if (!user.lastDownloadReset || user.lastDownloadReset < today) {
    if (!hasUnlimitedDownloads(user)) {
      user.downloadsRemaining = FREE_LIMIT();
    }
    user.lastDownloadReset = new Date();
    await user.save();
  }
}

export function hasDownloadQuota(user) {
  if (hasUnlimitedDownloads(user)) return true;
  return user.downloadsRemaining > 0;
}

export async function decrementDownloadQuota(userId) {
  const user = await User.findById(userId);
  if (!user) return;
  await ensureDailyDownloadReset(user);
  if (hasUnlimitedDownloads(user)) return;
  user.downloadsRemaining = Math.max(0, user.downloadsRemaining - 1);
  await user.save();
}
