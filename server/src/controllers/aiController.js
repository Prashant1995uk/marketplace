import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import { Note } from '../models/Note.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

async function getPdfTextFromNote(note) {
  if (!note.fileUrl) throw new AppError('No file URL', 400);
  const res = await fetch(note.fileUrl);
  if (!res.ok) throw new AppError('Could not fetch PDF for summarization', 502);
  const buf = Buffer.from(await res.arrayBuffer());
  const data = await pdfParse(buf);
  return (data.text || '').replace(/\s+/g, ' ').trim().slice(0, 14000);
}

export const summarizeNote = catchAsync(async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppError(
      'OpenAI API key not configured on server',
      503
    );
  }

  const note = await Note.findById(req.params.noteId);
  if (!note || note.status !== 'approved') {
    throw new AppError('Note not found', 404);
  }

  const text = await getPdfTextFromNote(note);
  if (!text || text.length < 50) {
    throw new AppError(
      'Not enough extractable text in PDF for summarization',
      400
    );
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You summarize study notes. Respond with a short title line, then bullet key points. Be concise.',
      },
      {
        role: 'user',
        content: `Summarize these notes:\n\n${text}`,
      },
    ],
    max_tokens: 800,
  });

  const summary =
    completion.choices[0]?.message?.content?.trim() || 'No summary produced.';

  res.json({
    success: true,
    data: {
      noteId: note._id,
      title: note.title,
      summary,
    },
  });
});
