import Property from '../models/Property.js';

export const createProperty = async (req, res, next) => {
  try {
    const data = req.validated?.body ?? req.body;
    const payload = { ...data, owner: req.user._id };
    const property = await Property.create(payload);
    res.status(201).json({ success: true, data: property, message: 'Property created' });
  } catch (error) {
    next(error);
  }
};

export const listProperties = async (req, res, next) => {
  try {
    const query = req.validated?.query ?? req.query;
    const { city, propertyType, listingType, minPrice, maxPrice, bedrooms, bathrooms, page = 1, limit = 12 } = query;
    const filter = { status: 'active' };

    if (city) filter.city = new RegExp(city, 'i');
    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name email role');

    res.json({
      success: true,
      data: { items: properties, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email role');
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    property.views += 1;
    await property.save();
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    if (!property.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    Object.assign(property, req.body);
    await property.save();
    res.json({ success: true, data: property, message: 'Property updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    if (!property.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    next(error);
  }
};
