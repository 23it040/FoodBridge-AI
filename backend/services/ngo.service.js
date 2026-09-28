const User = require('../models/User.model');
const FoodRequest = require('../models/FoodRequest.model');
const FoodDonation = require('../models/FoodDonation.model');
const ApiError = require('../utils/ApiError');

const DEFAULT_NEARBY_NGO_RADIUS_METERS = Number(process.env.NGO_NEARBY_RADIUS_METERS) || 10000;
const MAX_NEARBY_NGO_RADIUS_METERS = Number(process.env.NGO_MAX_NEARBY_RADIUS_METERS) || 50000;

const isValidCoordinatePair = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0);
};

const formatLocationData = (latitude, longitude) => {
  if (!isValidCoordinatePair(latitude, longitude)) return {};

  const lat = Number(latitude);
  const lng = Number(longitude);
  return {
    latitude: lat,
    longitude: lng,
    location: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
};

const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toNgoMapData = (ngo, distanceInKm = null) => {
  const coordinates = ngo.location?.coordinates;
  const latitude = Array.isArray(coordinates) && coordinates.length >= 2
    ? Number(coordinates[1])
    : Number(ngo.latitude);
  const longitude = Array.isArray(coordinates) && coordinates.length >= 2
    ? Number(coordinates[0])
    : Number(ngo.longitude);

  if (!isValidCoordinatePair(latitude, longitude)) return null;

  const addressParts = [];
  if (ngo.address) addressParts.push(ngo.address);
  if (ngo.city && (!ngo.address || !ngo.address.toLowerCase().includes(ngo.city.toLowerCase()))) {
    addressParts.push(ngo.city);
  }
  if (ngo.state && (!ngo.address || !ngo.address.toLowerCase().includes(ngo.state.toLowerCase()))) {
    addressParts.push(ngo.state);
  }
  const address = addressParts.join(', ') || (ngo.city ? `${ngo.city}, ${ngo.state || 'Gujarat'}` : 'Gujarat, India');


  return {
    id: ngo._id.toString(),
    name: ngo.organizationName || ngo.name || 'FoodBridge Partner NGO',
    organizationName: ngo.organizationName || ngo.name || 'FoodBridge Partner NGO',
    address,
    city: ngo.city || '',
    state: ngo.state || '',
    pincode: ngo.pincode || '',
    phone: ngo.phone || '',
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    foodTypesAccepted: ngo.foodTypesAccepted?.length ? ngo.foodTypesAccepted : ['cooked', 'packaged'],
    capacity: ngo.capacity ?? 150,
    isVerified: true,
    status: (ngo.status || 'ACTIVE').toLowerCase(),
    ...(distanceInKm != null && Number.isFinite(distanceInKm) && {
      distanceKm: Number(distanceInKm.toFixed(2))
    })
  };
};

const buildEligibleNgoQuery = () => ({
  role: 'ngo',
  $or: [
    { isVerified: true },
    { verificationStatus: 'APPROVED' }
  ],
  status: { $nin: ['SUSPENDED', 'BLOCKED'] }
});


const registerNgo = async ({ organizationName, registrationNumber, email, password, phone, address, city, state, pincode, latitude, longitude, profileImage }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email is already in use');
  }

  const existingRegistration = await User.findOne({ registrationNumber });
  if (existingRegistration) {
    throw new ApiError(409, 'Registration number is already in use');
  }

  const ngo = await User.create({
    name: organizationName,
    email,
    password: Math.random().toString(36).slice(-8),
    role: 'ngo',
    organizationName,
    registrationNumber,
    phone,
    address,
    city,
    state,
    pincode,
    ...formatLocationData(latitude, longitude),
    profileImage,
    isVerified: false,
    verificationStatus: 'PENDING'
  });

  ngo.password = undefined;
  return ngo;
};

const verifyNgo = async (ngoId, adminId, verificationStatus) => {
  const ngo = await User.findById(ngoId);
  if (!ngo || ngo.role !== 'ngo') {
    throw new ApiError(404, 'NGO not found');
  }

  if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(verificationStatus)) {
    throw new ApiError(400, 'Invalid verification status');
  }

  ngo.verificationStatus = verificationStatus;
  ngo.isVerified = verificationStatus === 'APPROVED';
  ngo.verifiedBy = adminId;
  ngo.verifiedAt = new Date();
  await ngo.save();
  return ngo;
};

const getNgoProfile = async (userId) => {
  const ngo = await User.findById(userId).select('-password');
  if (!ngo) {
    throw new ApiError(404, 'NGO profile not found');
  }
  return ngo;
};

const updateNgoProfile = async (userId, updateData) => {
  const ngo = await User.findById(userId);
  if (!ngo) {
    throw new ApiError(404, 'NGO profile not found');
  }

  const updatesLocation = Object.prototype.hasOwnProperty.call(updateData, 'latitude') ||
    Object.prototype.hasOwnProperty.call(updateData, 'longitude');

  Object.assign(ngo, updateData);

  if (updatesLocation) {
    if (!isValidCoordinatePair(ngo.latitude, ngo.longitude)) {
      throw new ApiError(400, 'Valid latitude and longitude are required for an NGO location.');
    }

    Object.assign(ngo, formatLocationData(ngo.latitude, ngo.longitude));
  }
  await ngo.save();
  ngo.password = undefined;
  return ngo;
};

const getDashboard = async (user) => {
  const ngoId = user._id || user;
  const match = user.role === 'admin' ? {} : { ngoId };

  const [
    totalRequests,
    pendingApproval,
    acceptedRequests,
    pickedUpRequests,
    completedClaims,
    completedMeals,
    recentRequests,
    requestsByMonthRaw,
    statusBreakdownRaw
  ] = await Promise.all([
    FoodRequest.countDocuments(match),
    FoodRequest.countDocuments({ ...match, status: 'PENDING' }),
    FoodRequest.countDocuments({ ...match, status: 'ACCEPTED' }),
    FoodRequest.countDocuments({ ...match, status: 'PICKED_UP' }),
    FoodRequest.countDocuments({ ...match, status: 'COMPLETED' }),
    FoodRequest.aggregate([
      { $match: { ...match, status: 'COMPLETED' } },
      {
        $lookup: {
          from: 'fooddonations',
          localField: 'foodId',
          foreignField: '_id',
          as: 'food'
        }
      },
      { $unwind: '$food' },
      {
        $group: {
          _id: null,
          totalMeals: { $sum: '$food.quantity' }
        }
      }
    ]),
    FoodRequest.find(match)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('foodId')
      .populate('donorId', 'name email'),
    FoodRequest.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]),
    FoodRequest.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const mealsDistributed = completedMeals[0]?.totalMeals || 0;
  const approvedPickups = acceptedRequests + pickedUpRequests;

  const requestsByMonth = requestsByMonthRaw.map((item) => ({
    month: item._id,
    count: item.count
  }));

  const statusBreakdown = statusBreakdownRaw.map((item) => ({
    name: String(item._id || 'PENDING').toUpperCase(),
    value: item.count
  }));

  const stats = {
    totalRequests,
    pendingApproval,
    pendingRequests: pendingApproval,
    approvedPickups,
    acceptedRequests,
    completedClaims,
    completedRequests: completedClaims,
    mealsDistributed,
    mealsCollected: mealsDistributed
  };

  return {
    stats,
    ...stats,
    totalFoodRequests: totalRequests,
    totalMealsCollected: mealsDistributed,
    recentRequests,
    requestsByMonth,
    statusBreakdown
  };
};

const findNearbyFood = async (user, query) => {
  const latitude = parseFloat(query.latitude || user.latitude);
  const longitude = parseFloat(query.longitude || user.longitude);
  const radiusKm = parseFloat(query.radius || 10);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new ApiError(400, 'Latitude and longitude are required for nearby food search');
  }

  const match = {
    status: 'AVAILABLE',
    expiryTime: { $gt: new Date() }
  };

  if (query.foodName) {
    match.foodName = { $regex: query.foodName, $options: 'i' };
  }
  if (query.category) {
    match.category = query.category;
  }
  if (query.city) {
    match.pickupAddress = { $regex: query.city, $options: 'i' };
  }

  const quantityQuery = parseFloat(query.quantity);
  const minQuantity = parseFloat(query.minQuantity);
  const maxQuantity = parseFloat(query.maxQuantity);

  if (!Number.isNaN(quantityQuery)) {
    match.quantity = quantityQuery;
  } else {
    const quantityFilter = {};
    if (!Number.isNaN(minQuantity)) {
      quantityFilter.$gte = minQuantity;
    }
    if (!Number.isNaN(maxQuantity)) {
      quantityFilter.$lte = maxQuantity;
    }
    if (Object.keys(quantityFilter).length > 0) {
      match.quantity = quantityFilter;
    }
  }
  if (query.expiryTime) {
    const expiryDate = new Date(query.expiryTime);
    if (!Number.isNaN(expiryDate.getTime())) {
      match.expiryTime = { ...match.expiryTime, $lte: expiryDate };
    }
  }

  const pipeline = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        distanceField: 'distanceInMeters',
        spherical: true,
        maxDistance: radiusKm * 1000,
        query: match
      }
    }
  ];

  const sortBy = query.sort || 'nearest';
  if (sortBy === 'latest') {
    pipeline.push({ $sort: { createdAt: -1 } });
  } else if (sortBy === 'highestQuantity') {
    pipeline.push({ $sort: { quantity: -1 } });
  }

  pipeline.push({
    $addFields: {
      distance: { $divide: ['$distanceInMeters', 1000] }
    }
  });
  pipeline.push({ $project: { distanceInMeters: 0 } });

  return FoodDonation.aggregate(pipeline);
};

const getHistory = async (user) => {
  const match = user.role === 'admin' ? {} : { ngoId: user._id };

  const [accepted, rejected] = await Promise.all([
    FoodRequest.find({ ...match, status: 'ACCEPTED' })
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email'),
    FoodRequest.find({ ...match, status: 'REJECTED' })
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email')
  ]);

  return {
    acceptedRequests: accepted,
    rejectedRequests: rejected,
    history: [...accepted, ...rejected]
  };
};

const getNgosForMap = async (options = {}) => {
  const query = buildEligibleNgoQuery();
  const ngos = await User.find(query).select('-password').lean();

  let userLat = null;
  let userLng = null;
  if (options.lat != null && options.lng != null && isValidCoordinatePair(options.lat, options.lng)) {
    userLat = Number(options.lat);
    userLng = Number(options.lng);
  }

  const results = [];
  for (const ngo of ngos) {
    let distKm = null;
    const coords = ngo.location?.coordinates;
    const ngoLat = Array.isArray(coords) && coords.length >= 2 ? Number(coords[1]) : Number(ngo.latitude);
    const ngoLng = Array.isArray(coords) && coords.length >= 2 ? Number(coords[0]) : Number(ngo.longitude);

    if (!isValidCoordinatePair(ngoLat, ngoLng)) continue;

    if (userLat !== null && userLng !== null) {
      distKm = calculateHaversineDistanceKm(userLat, userLng, ngoLat, ngoLng);
    }

    const mapData = toNgoMapData(ngo, distKm);
    if (mapData) results.push(mapData);
  }

  if (userLat !== null && userLng !== null) {
    results.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
  }

  return results;
};

const getNearbyNgos = async (latitude, longitude, radiusMeters, excludeId = null) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const radius = radiusMeters == null || radiusMeters === '' ? DEFAULT_NEARBY_NGO_RADIUS_METERS : Number(radiusMeters);
  const radiusKm = radius / 1000;

  if (!isValidCoordinatePair(lat, lng)) {
    throw new ApiError(400, 'Valid latitude and longitude are required');
  }

  const query = buildEligibleNgoQuery();
  if (excludeId) query._id = { $ne: excludeId };

  const ngos = await User.find(query).select('-password').lean();
  const allWithDistance = [];

  for (const ngo of ngos) {
    const coords = ngo.location?.coordinates;
    const ngoLat = Array.isArray(coords) && coords.length >= 2 ? Number(coords[1]) : Number(ngo.latitude);
    const ngoLng = Array.isArray(coords) && coords.length >= 2 ? Number(coords[0]) : Number(ngo.longitude);

    if (!isValidCoordinatePair(ngoLat, ngoLng)) continue;

    const distKm = calculateHaversineDistanceKm(lat, lng, ngoLat, ngoLng);
    const mapData = toNgoMapData(ngo, distKm);
    if (mapData) {
      allWithDistance.push(mapData);
    }
  }

  allWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  // Filter strictly within radius
  const results = allWithDistance.filter((n) => n.distanceKm <= radiusKm);

  if (process.env.NODE_ENV !== 'production') {
    console.info('[NGO MAP] Nearby NGO query:', { latitude: lat, longitude: lng, radiusKm, count: results.length });
  }

  return results;
};


module.exports = {
  registerNgo,
  verifyNgo,
  getNgoProfile,
  updateNgoProfile,
  getDashboard,
  findNearbyFood,
  getHistory,
  formatLocationData,
  getNgosForMap,
  getNearbyNgos
};
