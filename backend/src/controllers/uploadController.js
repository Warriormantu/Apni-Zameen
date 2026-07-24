import cloudinary from '../services/cloudinary.js';

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

    const uploaded = await Promise.all(req.files.map((file) => uploadBuffer(file.buffer)));
    const imageUrls = uploaded.map((item) => item.secure_url);

    res.json({ success: true, data: imageUrls });
  } catch (error) {
    next(error);
  }
};
