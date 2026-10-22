import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import cloudinary from '../services/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.error('Could not create uploads directory:', e);
  }
}

/**
 * Validates binary magic bytes to ensure file is genuinely a JPEG, PNG, or WebP.
 * Does NOT trust file.originalname or user-provided file extension alone.
 */
export const getValidatedImageExtension = (buffer, mimetype) => {
  if (!buffer || buffer.length < 12) return null;

  // JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
      return '.jpg';
    }
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    if (mimetype === 'image/png') {
      return '.png';
    }
  }

  // WebP magic bytes: RIFF....WEBP
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    if (mimetype === 'image/webp') {
      return '.webp';
    }
  }

  return null;
};

const uploadBuffer = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'apnizameen/properties', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });

export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No images provided' });
    }

    // Validate binary signatures for all uploaded files
    for (const file of req.files) {
      const validExt = getValidatedImageExtension(file.buffer, file.mimetype);
      if (!validExt) {
        return res.status(400).json({
          success: false,
          error: `Invalid file content for '${file.originalname}'. Only authentic JPEG, PNG, and WebP images are allowed.`,
        });
      }
      file.derivedExt = validExt;
    }

    // Try Cloudinary upload if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploaded = await Promise.all(req.files.map((file) => uploadBuffer(file.buffer)));
        const imageUrls = uploaded.map((item) => item.secure_url);
        return res.json({ success: true, data: imageUrls });
      } catch (cloudErr) {
        console.error('Cloudinary upload error, falling back to local storage:', cloudErr.message || cloudErr);
      }
    }

    // Fallback: save to local backend/uploads directory using derived extension
    const localUrls = req.files.map((file) => {
      try {
        const ext = file.derivedExt || '.jpg';
        const randomToken = crypto.randomBytes(8).toString('hex');
        const filename = `prop_${Date.now()}_${randomToken}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        return `/uploads/${filename}`;
      } catch {
        // Fallback to base64 data URI if disk write fails
        const mime = file.derivedExt === '.png' ? 'image/png' : file.derivedExt === '.webp' ? 'image/webp' : 'image/jpeg';
        return `data:${mime};base64,${file.buffer.toString('base64')}`;
      }
    });

    return res.json({ success: true, data: localUrls });
  } catch (error) {
    next(error);
  }
};
