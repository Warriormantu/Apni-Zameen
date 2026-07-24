import User from '../models/User.js';
import Property from '../models/Property.js';

export const toggleFavorite = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const user = await User.findById(req.user._id);
    const exists = user.favorites.some((fav) => fav.equals(property._id));
    if (exists) {
      user.favorites = user.favorites.filter((fav) => !fav.equals(property._id));
    } else {
      user.favorites.push(property._id);
    }
    await user.save();

    res.json({ success: true, data: user.favorites, message: exists ? 'Favorite removed' : 'Favorite added' });
  } catch (error) {
    next(error);
  }
};

export const listFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      select: 'title city state price propertyType',
    });
    res.json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};
