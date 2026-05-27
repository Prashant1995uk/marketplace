import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    commission: { type: Number, required: true, min: 0 },
    sellerReceives: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

purchaseSchema.index({ buyerId: 1, noteId: 1 }, { unique: true });

export const Purchase = mongoose.model('Purchase', purchaseSchema);
