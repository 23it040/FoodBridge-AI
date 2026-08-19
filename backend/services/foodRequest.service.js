const FoodRequest = require('../models/FoodRequest.model');
const FoodDonation = require('../models/FoodDonation.model');
const ApiError = require('../utils/ApiError');

const createRequest = async ({ foodId, ngoId, requestMessage, pickupDate, pickupTime }) => {
  const donation = await FoodDonation.findById(foodId);
  if (!donation) {
    throw new ApiError(404, 'Food donation not found');
  }

  if (donation.donorId.toString() === ngoId.toString()) {
    throw new ApiError(400, 'Donors cannot request their own food');
  }

  if (donation.status !== 'AVAILABLE') {
    throw new ApiError(400, 'Only available food donations can be requested');
  }

  const existing = await FoodRequest.findOne({ foodId, ngoId });
  if (existing) {
    throw new ApiError(409, 'You have already requested this food donation');
  }

  const request = await FoodRequest.create({
    foodId,
    donorId: donation.donorId,
    ngoId,
    requestMessage,
    pickupDate,
    pickupTime
  });

  await request.populate([
    { path: 'foodId' },
    { path: 'donorId', select: 'name email' },
    { path: 'ngoId', select: 'name email' }
  ]);

  return request;
};

const listRequests = async (user) => {
  if (user.role === 'admin') {
    return FoodRequest.find()
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email');
  }

  if (['partner', 'ngo'].includes(user.role)) {
    return FoodRequest.find({ ngoId: user._id })
      .populate('foodId')
      .populate('donorId', 'name email')
      .populate('ngoId', 'name email');
  }

  return FoodRequest.find({ donorId: user._id })
    .populate('foodId')
    .populate('donorId', 'name email')
    .populate('ngoId', 'name email');
};

const getRequestById = async (id, user) => {
  const request = await FoodRequest.findById(id)
    .populate('foodId')
    .populate('donorId', 'name email')
    .populate('ngoId', 'name email');

  if (!request) {
    throw new ApiError(404, 'Food request not found');
  }

  if (user.role !== 'admin' && request.ngoId._id.toString() !== user._id.toString() && request.donorId._id.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Access denied to this request');
  }

  return request;
};

const updateRequestStatus = async (id, user, { status, rejectionReason, completedAt }) => {
  const request = await FoodRequest.findById(id).populate('foodId');
  if (!request) {
    throw new ApiError(404, 'Food request not found');
  }

  const isDonor = request.donorId.toString() === user._id.toString();
  const isNgo = request.ngoId.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isDonor && !isNgo && !isAdmin) {
    throw new ApiError(403, 'Access denied to this request');
  }

  const validTransitions = {
    PENDING: ['ACCEPTED', 'REJECTED'],
    ACCEPTED: ['SCHEDULED', 'PICKED_UP', 'COMPLETED'],
    SCHEDULED: ['PICKED_UP', 'COMPLETED'],
    PICKED_UP: ['COMPLETED'],
    REJECTED: [],
    COMPLETED: []
  };

  const currentStatus = request.status || 'PENDING';
  if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
    throw new ApiError(400, `Invalid status transition from ${currentStatus} to ${status}`);
  }

  request.status = status;
  if (status === 'REJECTED') {
    request.rejectionReason = rejectionReason || '';
    request.completedAt = undefined;
  } else if (status === 'COMPLETED') {
    request.completedAt = completedAt ? new Date(completedAt) : new Date();
    request.rejectionReason = undefined;
  } else {
    request.rejectionReason = undefined;
    request.completedAt = undefined;
  }

  await request.save();

  if (['ACCEPTED', 'SCHEDULED', 'PICKED_UP', 'COMPLETED'].includes(status)) {
    await FoodDonation.findByIdAndUpdate(request.foodId._id, { status }, { new: true, runValidators: true });
  }

  return getRequestById(id, user);
};

const deleteRequest = async (id, user) => {
  const request = await FoodRequest.findById(id);
  if (!request) {
    throw new ApiError(404, 'Food request not found');
  }

  if (user.role !== 'admin' && request.ngoId.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Only the requesting NGO or admin can delete this request');
  }

  await request.deleteOne();
  return request;
};

module.exports = {
  createRequest,
  listRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest
};
