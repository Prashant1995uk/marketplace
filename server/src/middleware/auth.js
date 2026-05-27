import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  }
  if (!token) {
    throw new AppError('Not authorized. No token.', 401);
  }
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }
  user.syncPremiumFlags();
  if (user.isModified()) await user.save();
  req.user = user;
  next();
});

export const optionalAuth = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = header.slice(7);
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (user) {
      user.syncPremiumFlags();
      if (user.isModified()) await user.save();
      req.user = user;
    }
  } catch {
    /* ignore invalid optional token */
  }
  next();
});
