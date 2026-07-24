import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import { uploadImages } from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/images', protect, upload.array('images', 6), uploadImages);

export default router;
