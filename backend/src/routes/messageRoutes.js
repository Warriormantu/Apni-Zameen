import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { createMessage, listMessages } from '../controllers/messageController.js';
import { messageSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/', protect, validateRequest(messageSchema), createMessage);
router.get('/', protect, listMessages);

export default router;
