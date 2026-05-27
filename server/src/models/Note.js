import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    semester: { type: String, required: true, trim: true, index: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, default: null },
    fileHash: { type: String, required: true, index: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    downloads: { type: Number, default: 0 },
    price: { type: Number, default: 0, min: 0 },
    isPaid: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noteSchema.index({ fileHash: 1, uploadedBy: 1 }, { unique: true });

export const Note = mongoose.model('Note', noteSchema);
