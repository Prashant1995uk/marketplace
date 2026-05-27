import { Note } from '../models/Note.js';
import { Purchase } from '../models/Purchase.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

const commissionRate = () => Number(process.env.COMMISSION_RATE) || 0.2;

/**
 * Placeholder purchase: in production, verify payment with Razorpay/Stripe first.
 */
export const purchaseNote = catchAsync(async (req, res) => {
  const note = await Note.findById(req.params.noteId);
  if (!note || note.status !== 'approved') {
    throw new AppError('Note not found', 404);
  }
  if (!note.isPaid || note.price <= 0) {
    throw new AppError('This note is free', 400);
  }
  if (note.uploadedBy.toString() === req.user._id.toString()) {
    throw new AppError('You own this note', 400);
  }

  const existing = await Purchase.findOne({
    buyerId: req.user._id,
    noteId: note._id,
  });
  if (existing) {
    return res.json({
      success: true,
      message: 'Already purchased',
      data: existing,
    });
  }

  const amount = note.price;
  const commission = Math.round(amount * commissionRate() * 100) / 100;
  const sellerReceives = Math.round((amount - commission) * 100) / 100;

  const purchase = await Purchase.create({
    buyerId: req.user._id,
    noteId: note._id,
    amount,
    commission,
    sellerReceives,
  });

  res.status(201).json({
    success: true,
    message: 'Purchase recorded (integrate real payment gateway in production).',
    data: purchase,
  });
});
