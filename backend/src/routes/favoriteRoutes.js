import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { toggleFavorite, listFavorites } from '../controllers/favoriteController.js';

const router = express.Router();

router.post('/:propertyId', protect, toggleFavorite);
router.get('/', protect, listFavorites);

export default router;
