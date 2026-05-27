import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { signToken } from '../utils/jwt.js';
import { refreshLeaderboardEntry } from '../services/leaderboardService.js';

const FREE_LIMIT = () => Number(process.env.FREE_DAILY_DOWNLOAD_LIMIT) || 5;

export const signup = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    throw new AppError('Email already registered', 409);
  }
  const user = await User.create({
    name,
    email,
    password,
    downloadsRemaining: FREE_LIMIT(),
    lastDownloadReset: new Date(),
  });
  await refreshLeaderboardEntry(user._id);
  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
      downloadsRemaining: user.downloadsRemaining,
    },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  user.syncPremiumFlags();
  if (user.isModified()) await user.save();
  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
      downloadsRemaining: user.downloadsRemaining,
    },
  });
});

export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      downloadsRemaining: user.downloadsRemaining,
      uploadsCount: user.uploadsCount,
      personalDownloadsCount: user.personalDownloadsCount,
    },
  });
});
