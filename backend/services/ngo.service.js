const User = require('../models/User.model');
const FoodRequest = require('../models/FoodRequest.model');
const FoodDonation = require('../models/FoodDonation.model');
const ApiError = require('../utils/ApiError');

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
    latitude,
    longitude,
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

  Object.assign(ngo, updateData);
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

const DEMO_NGOS = [
  {
    id: 'ngo_demo_1',
    name: 'Helping Hands Surat Foundation',
    organizationName: 'Helping Hands Surat Foundation',
    address: 'Adajan, Surat, Gujarat',
    latitude: 21.1972,
    longitude: 72.7933,
    foodTypesAccepted: ['cooked', 'packaged', 'raw'],
    capacity: 250,
    isVerified: true,
    status: 'active',
    isDemoData: true
  },
  {
    id: 'ngo_demo_2',
    name: 'Annapurna Seva Trust Vesu',
    organizationName: 'Annapurna Seva Trust Vesu',
    address: 'Vesu Main Road, Surat, Gujarat',
    latitude: 21.1523,
    longitude: 72.7725,
    foodTypesAccepted: ['cooked', 'packaged'],
    capacity: 180,
    isVerified: true,
    status: 'active',
    isDemoData: true
  },
  {
    id: 'ngo_demo_3',
    name: 'Hope Food Bank Rander',
    organizationName: 'Hope Food Bank Rander',
    address: 'Rander Road, Surat, Gujarat',
    latitude: 21.2185,
    longitude: 72.7960,
    foodTypesAccepted: ['cooked', 'packaged', 'beverages'],
    capacity: 200,
    isVerified: true,
    status: 'active',
    isDemoData: true
  },
  {
    id: 'ngo_demo_4',
    name: 'Community Care Foundation Varachha',
    organizationName: 'Community Care Foundation Varachha',
    address: 'Varachha, Surat, Gujarat',
    latitude: 21.2144,
    longitude: 72.8464,
    foodTypesAccepted: ['cooked', 'packaged'],
    capacity: 120,
    isVerified: true,
    status: 'active',
    isDemoData: true
  },
  {
    id: 'ngo_demo_5',
    name: 'Food For All Katargam',
    organizationName: 'Food For All Katargam',
    address: 'Katargam, Surat, Gujarat',
    latitude: 21.2312,
    longitude: 72.8251,
    foodTypesAccepted: ['cooked', 'packaged', 'fruits'],
    capacity: 300,
    isVerified: true,
    status: 'active',
    isDemoData: true
  }
];

const formatLocationData = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return {};
  return {
    latitude: lat,
    longitude: lng,
    location: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };
};

const getNgosForMap = async (options = {}) => {
  const query = {
    role: 'ngo',
    $or: [{ isVerified: true }, { verificationStatus: 'APPROVED' }],
    status: { $ne: 'SUSPENDED' },
    latitude: { $ne: null, $exists: true },
    longitude: { $ne: null, $exists: true }
  };

  const ngos = await User.find(query).select('-password');

  let results = ngos.map((ngo) => ({
    id: ngo._id.toString(),
    name: ngo.organizationName || ngo.name,
    organizationName: ngo.organizationName || ngo.name,
    address: [ngo.address, ngo.city, ngo.state].filter(Boolean).join(', ') || 'Surat, Gujarat',
    city: ngo.city || 'Surat',
    state: ngo.state || 'Gujarat',
    pincode: ngo.pincode || '',
    phone: ngo.phone || '',
    latitude: Number(ngo.latitude),
    longitude: Number(ngo.longitude),
    foodTypesAccepted: ngo.foodTypesAccepted?.length ? ngo.foodTypesAccepted : ['cooked', 'packaged'],
    capacity: ngo.capacity || 150,
    isVerified: Boolean(ngo.isVerified || ngo.verificationStatus === 'APPROVED'),
    status: (ngo.status || 'ACTIVE').toLowerCase(),
    isDemoData: false
  }));

  return results;
};

const getNearbyNgos = async (latitude, longitude, radiusMeters = 10000, excludeId = null) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const radiusKm = Number(radiusMeters) / 1000;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new ApiError(400, 'Latitude and longitude are required');
  }

  const query = {
    role: 'ngo',
    $or: [{ isVerified: true }, { verificationStatus: 'APPROVED' }],
    status: { $ne: 'SUSPENDED' },
    latitude: { $ne: null, $exists: true },
    longitude: { $ne: null, $exists: true }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const ngos = await User.find(query).select('-password');

  const R = 6371; // Earth radius in km
  const results = [];

  ngos.forEach((ngo) => {
    const ngoLat = Number(ngo.latitude);
    const ngoLng = Number(ngo.longitude);
    if (Number.isNaN(ngoLat) || Number.isNaN(ngoLng)) return;

    const dLat = (ngoLat - lat) * (Math.PI / 180);
    const dLng = (ngoLng - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(ngoLat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = R * c;

    if (distKm <= radiusKm) {
      results.push({
        id: ngo._id.toString(),
        name: ngo.organizationName || ngo.name,
        organizationName: ngo.organizationName || ngo.name,
        address: [ngo.address, ngo.city, ngo.state].filter(Boolean).join(', ') || 'Surat, Gujarat',
        city: ngo.city || 'Surat',
        state: ngo.state || 'Gujarat',
        phone: ngo.phone || '',
        latitude: ngoLat,
        longitude: ngoLng,
        foodTypesAccepted: ngo.foodTypesAccepted?.length ? ngo.foodTypesAccepted : ['cooked', 'packaged'],
        capacity: ngo.capacity || 150,
        isVerified: Boolean(ngo.isVerified || ngo.verificationStatus === 'APPROVED'),
        status: (ngo.status || 'ACTIVE').toLowerCase(),
        distanceKm: Number(distKm.toFixed(2))
      });
    }
  });

  results.sort((a, b) => a.distanceKm - b.distanceKm);

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
