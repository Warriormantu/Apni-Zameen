import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { profileUpdateSchema } from '../validators/schemas.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, validateRequest(profileUpdateSchema), updateProfile);

export default router;
