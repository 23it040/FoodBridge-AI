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

  const [completed, rejected, pending, cancelled] = await Promise.all([
    FoodRequest.find({ ...match, status: 'COMPLETED' })
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email'),
    FoodRequest.find({ ...match, status: 'REJECTED' })
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email'),
    FoodRequest.find({ ...match, status: 'PENDING' })
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email'),
    FoodRequest.find({ ...match, status: 'REJECTED' })
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email')
  ]);

  return {
    completedDonations: completed,
    rejectedRequests: rejected,
    pendingRequests: pending,
    cancelledRequests: cancelled
  };
};

module.exports = {
  registerNgo,
  verifyNgo,
  getNgoProfile,
  updateNgoProfile,
  getDashboard,
  findNearbyFood,
  getHistory
};
