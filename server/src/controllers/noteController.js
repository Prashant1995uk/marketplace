import pdfParse from 'pdf-parse';
import { Note } from '../models/Note.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { hashBuffer } from '../utils/fileHash.js';
import { savePdfBuffer, deleteStoredFile } from '../services/storageService.js';
import { refreshLeaderboardEntry } from '../services/leaderboardService.js';

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildNoteFilter(query) {
  const parts = [{ status: 'approved' }];
  if (query.keyword) {
    const kw = String(query.keyword).trim();
    if (kw) {
      const rx = new RegExp(escapeRegex(kw), 'i');
      parts.push({ $or: [{ title: rx }, { subject: rx }] });
    }
  }
  if (query.subject) {
    parts.push({
      subject: new RegExp(`^${escapeRegex(query.subject)}$`, 'i'),
    });
  }
  if (query.semester) {
    parts.push({ semester: String(query.semester) });
  }
  if (
    query.minRating !== undefined &&
    query.minRating !== '' &&
    !Number.isNaN(Number(query.minRating))
  ) {
    parts.push({
      averageRating: { $gte: Number(query.minRating) },
    });
  }
  return parts.length === 1 ? parts[0] : { $and: parts };
}

export const listNotes = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  const filter = buildNoteFilter(req.query);
  const [items, total] = await Promise.all([
    Note.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-fileHash')
      .exec(),
    Note.countDocuments(filter),
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    data: items,
  });
});

export const getNoteById = catchAsync(async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate('uploadedBy', 'name email')
    .select('-fileHash');
  if (!note || note.status !== 'approved') {
    throw new AppError('Note not found', 404);
  }
  res.json({ success: true, data: note });
});

export const uploadNote = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('PDF file is required', 400);
  }
  const { title, subject, semester, price, isPaid } = req.body;
  const buffer = req.file.buffer;
  const fileHash = hashBuffer(buffer);

  const duplicate = await Note.findOne({
    fileHash,
    uploadedBy: req.user._id,
  });
  if (duplicate) {
    throw new AppError(
      'You have already uploaded this file (duplicate content).',
      409
    );
  }

  const { fileUrl, filePublicId } = await savePdfBuffer(
    buffer,
    req.file.originalname
  );

  const paid = isPaid === true || isPaid === 'true';
  const note = await Note.create({
    title,
    subject,
    semester: String(semester),
    fileUrl,
    filePublicId,
    fileHash,
    uploadedBy: req.user._id,
    price: paid ? Math.max(0, Number(price) || 0) : 0,
    isPaid: paid,
    status: 'pending',
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { uploadsCount: 1 },
  });
  await refreshLeaderboardEntry(req.user._id);

  res.status(201).json({
    success: true,
    message: 'Note uploaded; pending admin approval.',
    data: note,
  });
});

export const deleteNote = catchAsync(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) throw new AppError('Note not found', 404);
  if (note.uploadedBy.toString() !== req.user._id.toString()) {
    throw new AppError('Not allowed', 403);
  }
  await deleteStoredFile(note.filePublicId, note.fileUrl);
  await Note.findByIdAndDelete(note._id);
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { uploadsCount: -1 },
  });
  await refreshLeaderboardEntry(req.user._id);
  res.json({ success: true, message: 'Note deleted' });
});

export const getMyUploads = catchAsync(async (req, res) => {
  const notes = await Note.find({ uploadedBy: req.user._id })
    .sort({ createdAt: -1 })
    .select('-fileHash');
  res.json({ success: true, data: notes });
});

/** Extract text from PDF buffer (for AI). Max chars to avoid huge payloads. */
export async function extractPdfText(buffer, maxChars = 12000) {
  const data = await pdfParse(buffer);
  const text = (data.text || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, maxChars);
}
