import User from '../models/User.js';

export const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.validated.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.profileImage = profileImage ?? user.profileImage;
    await user.save();
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
};
