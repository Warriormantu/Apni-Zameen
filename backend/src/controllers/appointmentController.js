import Appointment from '../models/Appointment.js';
import Property from '../models/Property.js';

export const createAppointment = async (req, res, next) => {
  try {
    const { property: propertyId, date, time, notes } = req.validated.body;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      property: propertyId,
      date,
      time,
      notes,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: appointment, message: 'Appointment requested' });
  } catch (error) {
    next(error);
  }
};

export const listAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {};

    if (req.user.role === 'user') {
      filter.user = req.user._id;
    } else if (req.user.role === 'owner' || req.user.role === 'agent') {
      const properties = await Property.find({
        $or: [{ owner: req.user._id }, { agent: req.user._id }],
      }).select('_id');
      filter.property = { $in: properties.map((item) => item._id) };
    } else if (req.user.role === 'admin' && req.query.user) {
      filter.user = req.query.user;
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('user', 'name email')
      .populate('property', 'title city state price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: { items: appointments, total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    if (!/^[0-9a-fA-F]{24}$/.test(appointmentId)) {
      return res.status(400).json({ success: false, error: 'Invalid appointment ID format' });
    }

    const { status } = req.validated.body;
    const appointment = await Appointment.findById(appointmentId).populate('property');
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    if (!appointment.property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const property = appointment.property;
    const isOwner = Boolean(
      property.owner && (property.owner.equals ? property.owner.equals(req.user._id) : property.owner.toString() === req.user._id.toString())
    );
    const isAgent = Boolean(
      property.agent && (property.agent.equals ? property.agent.equals(req.user._id) : property.agent.toString() === req.user._id.toString())
    );
    const isRequester = Boolean(
      appointment.user && (appointment.user.equals ? appointment.user.equals(req.user._id) : appointment.user.toString() === req.user._id.toString())
    );

    if (req.user.role === 'admin') {
      // Administrators have full access
    } else if (req.user.role === 'user') {
      if (!isRequester) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
    } else if (req.user.role === 'owner' || req.user.role === 'agent') {
      if (!isOwner && !isAgent) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
    } else {
      // Unsupported or unauthorized roles cannot modify appointments
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    appointment.status = status;
    await appointment.save();
    res.json({ success: true, data: appointment, message: 'Appointment updated' });
  } catch (error) {
    next(error);
  }
};
