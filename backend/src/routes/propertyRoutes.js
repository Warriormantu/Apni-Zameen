import express from 'express';
import {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import {
  propertyCreateSchema,
  propertyQuerySchema,
  propertyUpdateSchema,
  propertyIdParamSchema,
} from '../validators/schemas.js';

const router = express.Router();

router.get('/', validateRequest(propertyQuerySchema), listProperties);
router.get('/mine', protect, getMyProperties);
router.get('/:id', validateRequest(propertyIdParamSchema), getProperty);
router.post('/', protect, authorize('user', 'owner', 'agent', 'admin'), validateRequest(propertyCreateSchema), createProperty);
router.put('/:id', protect, validateRequest(propertyUpdateSchema), updateProperty);
router.delete('/:id', protect, validateRequest(propertyIdParamSchema), deleteProperty);

export default router;
