import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Placeholder: ₹99/month — wire Razorpay/Stripe webhook in production.
 */
export const subscribePremium = catchAsync(async (req, res) => {
  const { paymentConfirmed } = req.body;
  if (paymentConfirmed !== true && paymentConfirmed !== 'true') {
    throw new AppError(
      'Set paymentConfirmed=true after successful payment (placeholder).',
      400
    );
  }

  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      role: 'premium',
      isPremium: true,
      premiumExpiresAt: expires,
    },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Premium activated (placeholder — use a real payment provider).',
    user: {
      id: user._id,
      role: user.role,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
    },
  });
});
