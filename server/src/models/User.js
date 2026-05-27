import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['user', 'premium', 'admin'],
      default: 'user',
    },
    downloadsRemaining: { type: Number, default: 5 },
    lastDownloadReset: { type: Date, default: Date.now },
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null },
    uploadsCount: { type: Number, default: 0 },
    personalDownloadsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.syncPremiumFlags = function syncPremiumFlags() {
  if (this.role === 'admin') return;
  const now = new Date();
  if (this.isPremium && this.premiumExpiresAt && this.premiumExpiresAt < now) {
    this.isPremium = false;
    this.role = 'user';
  }
};

export const User = mongoose.model('User', userSchema);
