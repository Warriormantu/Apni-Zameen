import express from 'express';
import {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { propertyCreateSchema, propertyQuerySchema } from '../validators/schemas.js';

const router = express.Router();

router.get('/', validateRequest(propertyQuerySchema), listProperties);
router.get('/:id', getProperty);
router.post('/', protect, authorize('owner', 'agent', 'admin'), validateRequest(propertyCreateSchema), createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

export default router;
