import express from 'express';
import { login, register, me } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { authLoginSchema, authRegisterSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/register', validateRequest(authRegisterSchema), register);
router.post('/login', validateRequest(authLoginSchema), login);
router.get('/me', protect, me);

export default router;
