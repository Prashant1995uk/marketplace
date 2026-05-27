/**
 * Usage: MONGODB_URI=... node scripts/createAdmin.js admin@example.com secretpass "Admin Name"
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

const [, , email, password, name = 'Admin'] = process.argv;

async function main() {
  if (!email || !password) {
    console.error('Usage: node scripts/createAdmin.js <email> <password> [name]');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      name,
      email: email.toLowerCase(),
      password: hash,
      role: 'admin',
      isPremium: true,
      downloadsRemaining: 9999,
    },
    { upsert: true, new: true }
  );
  console.log('Admin ready:', user.email);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
