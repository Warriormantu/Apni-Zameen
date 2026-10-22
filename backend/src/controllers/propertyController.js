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

export const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const listProperties = async (req, res, next) => {
  try {
    const query = req.validated?.query ?? req.query;
    const { city, propertyType, listingType, minPrice, maxPrice, bedrooms, bathrooms, search, sort, page = 1, limit = 12 } = query;
    const filter = { status: 'active' };

    if (city && typeof city === 'string' && city.trim()) {
      const safeCity = city.trim().slice(0, 100);
      filter.city = new RegExp(escapeRegex(safeCity), 'i');
    }
    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;

    if (bedrooms) {
      if (bedrooms === '4+' || String(bedrooms).includes('+') || Number(bedrooms) >= 4) {
        filter.bedrooms = { $gte: 4 };
      } else {
        filter.bedrooms = Number(bedrooms);
      }
    }
    if (bathrooms) filter.bathrooms = Number(bathrooms);

    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    if (search && typeof search === 'string' && search.trim()) {
      const safeSearch = search.trim().slice(0, 200);
      const searchRegex = new RegExp(escapeRegex(safeSearch), 'i');
      filter.$or = [
        { title: searchRegex },
        { 'location.address': searchRegex },
        { city: searchRegex },
        { description: searchRegex },
        { amenities: searchRegex },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'area_desc') sortObj = { area: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Run countDocuments and find in parallel via Promise.all to cut database latency in half
    const [total, properties] = await Promise.all([
      Property.countDocuments(filter),
      Property.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name email role phone')
        .populate('agent', 'name email role phone')
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        items: properties,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    if (!/^[0-9a-fA-F]{24}$/.test(propertyId)) {
      return res.status(400).json({ success: false, error: 'Invalid property ID format' });
    }

    // Atomic view increment and single-roundtrip query with lean()
    const property = await Property.findByIdAndUpdate(
      propertyId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('owner', 'name email role phone')
      .populate('agent', 'name email role phone')
      .lean();

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    if (!/^[0-9a-fA-F]{24}$/.test(propertyId)) {
      return res.status(400).json({ success: false, error: 'Invalid property ID format' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    if (!property.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const rawData = req.validated?.body ?? req.body;
    // Defense-in-depth: whitelist only approved editable fields and ignore any protected keys
    const ALLOWED_UPDATE_FIELDS = [
      'title',
      'description',
      'propertyType',
      'listingType',
      'price',
      'location',
      'city',
      'state',
      'pincode',
      'bedrooms',
      'bathrooms',
      'area',
      'amenities',
      'images',
      'videos',
      'status',
    ];

    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (rawData[key] !== undefined) {
        property[key] = rawData[key];
      }
    }

    await property.save();
    res.json({ success: true, data: property, message: 'Property updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    if (!/^[0-9a-fA-F]{24}$/.test(propertyId)) {
      return res.status(400).json({ success: false, error: 'Invalid property ID format' });
    }

    const property = await Property.findById(propertyId);
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

export const getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({
      $or: [{ owner: req.user._id }, { agent: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: properties });
  } catch (error) {
    next(error);
  }
};
