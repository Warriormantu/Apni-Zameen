import Message from '../models/Message.js';
import Property from '../models/Property.js';

export const createMessage = async (req, res, next) => {
  try {
    const { property: propertyId, receiver, message } = req.validated.body;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const msg = await Message.create({
      sender: req.user._id,
      receiver,
      property: propertyId,
      message,
    });

    res.status(201).json({ success: true, data: msg, message: 'Message sent' });
  } catch (error) {
    next(error);
  }
};

export const listMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    };

    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('property', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: { items: messages, total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    next(error);
  }
};
