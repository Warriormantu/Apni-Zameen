import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { createAppointment, listAppointments, updateAppointment } from '../controllers/appointmentController.js';
import { appointmentSchema, appointmentUpdateSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/', protect, validateRequest(appointmentSchema), createAppointment);
router.get('/', protect, listAppointments);
router.patch('/:id', protect, validateRequest(appointmentUpdateSchema), updateAppointment);

export default router;
