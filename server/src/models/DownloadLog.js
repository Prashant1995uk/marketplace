import mongoose from 'mongoose';

const downloadLogSchema = new mongoose.Schema(
  {
    userId: {
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
  },
  { timestamps: true }
);

downloadLogSchema.index({ userId: 1, createdAt: -1 });

export const DownloadLog = mongoose.model('DownloadLog', downloadLogSchema);
