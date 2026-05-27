import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { cloudinary } from '../config/cloudinary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localDir = path.join(__dirname, '../../public/uploads');

export async function savePdfBuffer(buffer, originalName) {
  const useCloud =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (useCloud) {
    const b64 = buffer.toString('base64');
    const dataUri = `data:application/pdf;base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'notes_marketplace',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true,
    });
    return {
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
    };
  }

  await fs.mkdir(localDir, { recursive: true });
  const safe = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const dest = path.join(localDir, safe);
  await fs.writeFile(dest, buffer);
  const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return {
    fileUrl: `${base}/uploads/${safe}`,
    filePublicId: null,
  };
}

export async function deleteStoredFile(filePublicId, fileUrl) {
  const useCloud =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (useCloud && filePublicId) {
    try {
      await cloudinary.uploader.destroy(filePublicId, { resource_type: 'raw' });
    } catch {
      /* ignore */
    }
    return;
  }

  if (fileUrl && fileUrl.includes('/uploads/')) {
    const name = fileUrl.split('/uploads/')[1];
    if (name) {
      try {
        await fs.unlink(path.join(localDir, name));
      } catch {
        /* ignore */
      }
    }
  }
}
