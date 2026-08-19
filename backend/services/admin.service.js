const mongoose = require('mongoose');
const User = require('../models/User.model');
const FoodDonation = require('../models/FoodDonation.model');
const FoodRequest = require('../models/FoodRequest.model');
const Notification = require('../models/Notification.model');
const AuditLog = require('../models/AuditLog.model');
const ApiError = require('../utils/ApiError');

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getDashboard = async () => {
  const now = new Date();
  const totalUsers = await User.countDocuments();
  const totalDonors = await User.countDocuments({ role: { $in: ['user', 'partner'] } });
  const totalNgos = await User.countDocuments({ role: 'ngo' });
  const verifiedNgos = await User.countDocuments({ role: 'ngo', isVerified: true });
  const pendingNgoVerifications = await User.countDocuments({ role: 'ngo', verificationStatus: 'PENDING' });

  const totalFoodDonations = await FoodDonation.countDocuments();
  const availableDonations = await FoodDonation.countDocuments({ status: 'AVAILABLE' });
  const acceptedDonations = await FoodDonation.countDocuments({ status: 'ACCEPTED' });
  const pickedUpDonations = await FoodDonation.countDocuments({ status: 'PICKED_UP' });
  const completedDonations = await FoodDonation.countDocuments({ status: 'COMPLETED' });
  const expiredDonations = await FoodDonation.countDocuments({ status: 'EXPIRED' });

  const totalFoodRequests = await FoodRequest.countDocuments();
  const pendingRequests = await FoodRequest.countDocuments({ status: 'PENDING' });
  const acceptedRequests = await FoodRequest.countDocuments({ status: 'ACCEPTED' });
  const rejectedRequests = await FoodRequest.countDocuments({ status: 'REJECTED' });
  const completedRequests = await FoodRequest.countDocuments({ status: 'COMPLETED' });

  const totalMealsDonatedResult = await FoodDonation.aggregate([
    { $group: { _id: null, totalMeals: { $sum: '$quantity' } } }
  ]);

  const totalMealsDistributedResult = await FoodRequest.aggregate([
    {
      $match: { status: 'COMPLETED' }
    },
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
  ]);

  const latestDonations = await FoodDonation.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('donorId', 'name email');

  const latestRequests = await FoodRequest.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('foodId')
    .populate('donorId', 'name email')
    .populate('ngoId', 'name email');

  const latestUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('-password');

  return {
    totalUsers,
    totalDonors,
    totalNgos,
    verifiedNgos,
    pendingNgoVerifications,
    totalFoodDonations,
    availableDonations,
    acceptedDonations,
    pickedUpDonations,
    completedDonations,
    expiredDonations,
    totalFoodRequests,
    pendingRequests,
    acceptedRequests,
    rejectedRequests,
    completedRequests,
    totalMealsDonated: totalMealsDonatedResult[0]?.totalMeals || 0,
    totalMealsDistributed: totalMealsDistributedResult[0]?.totalMeals || 0,
    latestDonations,
    latestRequests,
    latestUsers
  };
};

const listUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  if (query.role) {
    filter.role = query.role;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ]);

  return { items: users, users, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
};

const getUserById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const updateUser = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new ApiError(409, 'Email is already in use');
    }
  }

  const updatableFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'role', 'status'];
  updatableFields.forEach((field) => {
    if (data[field] !== undefined) {
      user[field] = data[field];
    }
  });

  await user.save();
  user.password = undefined;
  return user;
};

const deleteUser = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const updateUserStatus = async (id, status, reason) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  if (!['ACTIVE', 'SUSPENDED', 'BLOCKED'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.status = status;
  if (reason) {
    user.statusReason = reason;
  } else {
    user.statusReason = undefined;
  }

  await user.save();
  user.password = undefined;
  return user;
};

const listPendingNgos = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { role: 'ngo', verificationStatus: 'PENDING' };

  const [ngos, total] = await Promise.all([
    User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ]);

  return { items: ngos, ngos, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
};

const changeNgoVerification = async (id, action, adminId, reason) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid NGO ID');
  }

  const ngo = await User.findById(id);
  if (!ngo || ngo.role !== 'ngo') {
    throw new ApiError(404, 'NGO not found');
  }

  if (!['approve', 'reject', 'suspend'].includes(action)) {
    throw new ApiError(400, 'Invalid verification action');
  }

  if (action === 'approve') {
    ngo.verificationStatus = 'APPROVED';
    ngo.isVerified = true;
    ngo.status = 'ACTIVE';
    ngo.verificationRejectionReason = undefined;
  } else if (action === 'reject') {
    ngo.verificationStatus = 'REJECTED';
    ngo.isVerified = false;
    ngo.verificationRejectionReason = reason || 'Verification request rejected by admin';
  } else if (action === 'suspend') {
    ngo.verificationStatus = 'SUSPENDED';
    ngo.isVerified = false;
    ngo.status = 'SUSPENDED';
    ngo.verificationRejectionReason = reason || 'NGO suspended by admin';
  }

  ngo.verifiedBy = adminId;
  ngo.verifiedAt = new Date();
  await ngo.save();
  ngo.password = undefined;
  return ngo;
};

const buildDonationFilter = (query) => {
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [{ foodName: searchRegex }, { category: searchRegex }, { pickupAddress: searchRegex }];
  }
  if (query.category) {
    filter.category = query.category;
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.city) {
    filter.pickupAddress = { $regex: query.city, $options: 'i' };
  }
  if (query.donorId && mongoose.Types.ObjectId.isValid(query.donorId)) {
    filter.donorId = query.donorId;
  }
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }
  if (query.minQuantity || query.maxQuantity) {
    filter.quantity = {};
    if (query.minQuantity) {
      filter.quantity.$gte = Number(query.minQuantity);
    }
    if (query.maxQuantity) {
      filter.quantity.$lte = Number(query.maxQuantity);
    }
  }

  return filter;
};

const listDonations = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildDonationFilter(query);

  const [donations, total] = await Promise.all([
    FoodDonation.find(filter)
      .populate('donorId', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    FoodDonation.countDocuments(filter)
  ]);

  return { items: donations, donations, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
};

const getDonationById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid donation ID');
  }

  const donation = await FoodDonation.findById(id).populate('donorId', 'name email');
  if (!donation) {
    throw new ApiError(404, 'Donation not found');
  }

  return donation;
};

const updateDonationStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid donation ID');
  }

  const donation = await FoodDonation.findById(id);
  if (!donation) {
    throw new ApiError(404, 'Donation not found');
  }

  if (!['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKED_UP', 'COMPLETED', 'REJECTED', 'EXPIRED'].includes(status)) {
    throw new ApiError(400, 'Invalid donation status');
  }

  donation.status = status;
  await donation.save();
  return donation;
};

const deleteDonation = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid donation ID');
  }

  const donation = await FoodDonation.findByIdAndDelete(id);
  if (!donation) {
    throw new ApiError(404, 'Donation not found');
  }

  return donation;
};

const buildRequestFilter = (query) => {
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { requestMessage: searchRegex },
      { rejectionReason: searchRegex }
    ];
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.donorId && mongoose.Types.ObjectId.isValid(query.donorId)) {
    filter.donorId = query.donorId;
  }

  if (query.ngoId && mongoose.Types.ObjectId.isValid(query.ngoId)) {
    filter.ngoId = query.ngoId;
  }

  if (query.foodId && mongoose.Types.ObjectId.isValid(query.foodId)) {
    filter.foodId = query.foodId;
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  return filter;
};

const listRequests = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildRequestFilter(query);

  const [requests, total] = await Promise.all([
    FoodRequest.find(filter)
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    FoodRequest.countDocuments(filter)
  ]);

  return { items: requests, requests, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
};

const getRequestById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid request ID');
  }

  const request = await FoodRequest.findById(id)
    .populate('foodId')
    .populate('donorId', 'name email')
    .populate('ngoId', 'name email');

  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  return request;
};

const updateRequestStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid request ID');
  }

  const request = await FoodRequest.findById(id).populate('foodId');
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  if (!['PENDING', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'].includes(status)) {
    throw new ApiError(400, 'Invalid request status');
  }

  request.status = status;
  if (status === 'COMPLETED') {
    request.completedAt = new Date();
  }
  await request.save();

  if (['ACCEPTED', 'PICKED_UP', 'COMPLETED'].includes(status) && request.foodId) {
    await FoodDonation.findByIdAndUpdate(request.foodId._id, { status }, { new: true, runValidators: true });
  }

  return getRequestById(id);
};

const deleteRequest = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid request ID');
  }

  const request = await FoodRequest.findByIdAndDelete(id);
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  return request;
};

const getDateGroup = (range) => {
  switch (range) {
    case 'daily':
      return '%Y-%m-%d';
    case 'weekly':
      return '%Y-%V';
    case 'yearly':
      return '%Y';
    case 'monthly':
    default:
      return '%Y-%m';
  }
};

const buildDateRange = (range, startDate, endDate) => {
  const now = new Date();
  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  if (!start) {
    if (range === 'daily') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (range === 'weekly') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28);
    } else if (range === 'yearly') {
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }
  }

  if (!end) {
    end = now;
  }

  return { start, end };
};

const reportsOverview = async (range = 'monthly', startDate, endDate) => {
  const { start, end } = buildDateRange(range, startDate, endDate);
  const matchUsers = { createdAt: { $gte: start, $lte: end } };
  const matchDonations = { createdAt: { $gte: start, $lte: end } };
  const matchRequests = { createdAt: { $gte: start, $lte: end } };

  const [newUsers, donationCount, requestCount, mealsDonatedResult, mealsDistributedResult] = await Promise.all([
    User.countDocuments(matchUsers),
    FoodDonation.countDocuments(matchDonations),
    FoodRequest.countDocuments(matchRequests),
    FoodDonation.aggregate([
      { $match: matchDonations },
      { $group: { _id: null, totalMeals: { $sum: '$quantity' } } }
    ]),
    FoodRequest.aggregate([
      { $match: { ...matchRequests, status: 'COMPLETED' } },
      { $lookup: { from: 'fooddonations', localField: 'foodId', foreignField: '_id', as: 'food' } },
      { $unwind: '$food' },
      { $group: { _id: null, totalMeals: { $sum: '$food.quantity' } } }
    ])
  ]);

  return {
    range,
    start,
    end,
    newUsers,
    donationCount,
    requestCount,
    mealsDonated: mealsDonatedResult[0]?.totalMeals || 0,
    mealsDistributed: mealsDistributedResult[0]?.totalMeals || 0
  };
};

const reportsDonations = async (range = 'monthly', startDate, endDate) => {
  const { start, end } = buildDateRange(range, startDate, endDate);
  const groupId = getDateGroup(range);

  const donations = await FoodDonation.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { period: { $dateToString: { format: groupId, date: '$createdAt' } }, category: '$category' },
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    { $sort: { '_id.period': 1 } }
  ]);

  return donations;
};

const reportsRequests = async (range = 'monthly', startDate, endDate) => {
  const { start, end } = buildDateRange(range, startDate, endDate);
  const groupId = getDateGroup(range);

  const requests = await FoodRequest.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { period: { $dateToString: { format: groupId, date: '$createdAt' } }, status: '$status' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.period': 1 } }
  ]);

  return requests;
};

const reportsUsers = async (range = 'monthly', startDate, endDate) => {
  const { start, end } = buildDateRange(range, startDate, endDate);
  const groupId = getDateGroup(range);

  const users = await User.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { period: { $dateToString: { format: groupId, date: '$createdAt' } }, role: '$role' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.period': 1 } }
  ]);

  return users;
};

const getAnalytics = async () => {
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  const donationsByCategory = await FoodDonation.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
  ]);

  const requestsByStatus = await FoodRequest.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const monthlyDonationTrend = await FoodDonation.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        donations: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const monthlyRequestTrend = await FoodRequest.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        requests: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const topDonors = await FoodDonation.aggregate([
    {
      $group: {
        _id: '$donorId',
        totalQuantity: { $sum: '$quantity' },
        donations: { $sum: 1 }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 }
  ]);

  const topNgos = await FoodRequest.aggregate([
    {
      $group: {
        _id: '$ngoId',
        requestCount: { $sum: 1 }
      }
    },
    { $sort: { requestCount: -1 } },
    { $limit: 5 }
  ]);

  const mostDonatedCategories = await FoodDonation.aggregate([
    {
      $group: {
        _id: '$category',
        quantity: { $sum: '$quantity' },
        count: { $sum: 1 }
      }
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 }
  ]);

  const averagePickupTimeResult = await FoodRequest.aggregate([
    {
      $match: { pickupDate: { $exists: true, $ne: null } }
    },
    {
      $project: {
        diffMillis: { $subtract: ['$pickupDate', '$createdAt'] }
      }
    },
    {
      $group: {
        _id: null,
        avgPickupMillis: { $avg: '$diffMillis' }
      }
    }
  ]);

  const averageCompletionTimeResult = await FoodRequest.aggregate([
    {
      $match: { completedAt: { $exists: true, $ne: null } }
    },
    {
      $project: {
        diffMillis: { $subtract: ['$completedAt', '$createdAt'] }
      }
    },
    {
      $group: {
        _id: null,
        avgCompletionMillis: { $avg: '$diffMillis' }
      }
    }
  ]);

  const getUsersByIds = async (items) => {
    const ids = items.map((item) => item._id).filter(Boolean);
    const users = await User.find({ _id: { $in: ids } }).select('name email role');
    return items.map((item) => ({
      user: users.find((u) => u._id.toString() === item._id.toString()),
      ...item,
      _id: undefined
    }));
  };

  const topDonorUsers = await getUsersByIds(topDonors);
  const topNgoUsers = await getUsersByIds(topNgos);

  return {
    usersByRole,
    donationsByCategory,
    requestsByStatus,
    monthlyDonationTrend,
    monthlyRequestTrend,
    topDonors: topDonorUsers,
    topNgos: topNgoUsers,
    mostDonatedCategories,
    averagePickupTimeMinutes: averagePickupTimeResult[0] ? averagePickupTimeResult[0].avgPickupMillis / 60000 : 0,
    averageCompletionTimeMinutes: averageCompletionTimeResult[0]
      ? averageCompletionTimeResult[0].avgCompletionMillis / 60000
      : 0
  };
};

const sendNotification = async ({ recipientType, recipientId, title, message, type, data, createdBy }) => {
  if (recipientType === 'USER' && !recipientId) {
    throw new ApiError(400, 'recipientId is required for USER notifications');
  }
  const notification = await Notification.create({
    recipientType,
    recipient: recipientId,
    sender: createdBy,
    title,
    message,
    type,
    data,
    createdBy
  });
  return notification;
};

const listAuditLogs = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('adminId', 'name email role')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    AuditLog.countDocuments()
  ]);

  const normalizedLogs = logs.map((log) => ({
    action: log.action,
    user: log.adminId ? { id: log.adminId._id, name: log.adminId.name, email: log.adminId.email, role: log.adminId.role } : null,
    timestamp: log.createdAt,
    entity: log.resourceType,
    details: log.details
  }));

  return { items: normalizedLogs, logs: normalizedLogs, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
};

const listNotifications = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};

  if (query.recipientType) {
    filter.recipientType = query.recipientType;
  }
  if (query.recipientId && mongoose.Types.ObjectId.isValid(query.recipientId)) {
    filter.recipient = query.recipientId;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Notification.countDocuments(filter)
  ]);

  return { items: notifications, notifications, page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
};

module.exports = {
  getDashboard,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  listPendingNgos,
  changeNgoVerification,
  listDonations,
  getDonationById,
  updateDonationStatus,
  deleteDonation,
  listRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest,
  reportsOverview,
  reportsDonations,
  reportsRequests,
  reportsUsers,
  getAnalytics,
  sendNotification,
  listAuditLogs,
  listNotifications
};
