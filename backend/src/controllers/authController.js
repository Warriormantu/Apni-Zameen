import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const formatUserResponse = (user) => {
  if (!user) return null;
  const idStr = user._id ? user._id.toString() : user.id?.toString();
  const raw = user.toObject ? user.toObject() : { ...user };
  delete raw.password;
  return {
    ...raw,
    _id: idStr,
    id: idStr,
  };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.validated.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const user = await User.create({ name, email, phone, password, role });
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: formatUserResponse(user),
        token,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.validated.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = createToken(user._id);
    res.json({
      success: true,
      data: {
        user: formatUserResponse(user),
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    res.json({ success: true, data: formatUserResponse(req.user) });
  } catch (error) {
    next(error);
  }
};
