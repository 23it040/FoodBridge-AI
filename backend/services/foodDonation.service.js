const FoodDonation = require('../models/FoodDonation.model');
const ApiError = require('../utils/ApiError');

const createDonation = async (donationData) => {
  const donation = await FoodDonation.create(donationData);
  return donation;
};

const listDonations = async (user, query = {}) => {
  const now = new Date();
  let filter;

  if (user && user.role === 'admin') {
    filter = {};
  } else if (user) {
    filter = {
      $or: [
        { status: 'AVAILABLE', expiryTime: { $gt: now } },
        { donorId: user._id }
      ]
    };
  } else {
    filter = { status: 'AVAILABLE', expiryTime: { $gt: now } };
  }

  if (query.status && (!user || user.role !== 'admin')) {
    filter.status = query.status;
  }

  let dbQuery = FoodDonation.find(filter).populate('donorId', 'name email role').sort({ createdAt: -1 });

  if (query.limit && Number(query.limit) > 0) {
    dbQuery = dbQuery.limit(Number(query.limit));
  }

  return dbQuery;
};

const mongoose = require('mongoose');

const getDonationById = async (id, user) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid food donation ID');
  }

  const donation = await FoodDonation.findById(id).populate('donorId', 'name email role');
  if (!donation) {
    throw new ApiError(404, 'Food donation not found');
  }

  const userRole = (user && user.role) ? String(user.role).toLowerCase() : '';
  const isDonor = user && donation.donorId && (donation.donorId._id || donation.donorId).toString() === user._id.toString();
  const isAdmin = userRole === 'admin';
  const isNGO = userRole === 'ngo' || userRole === 'partner';
  const isAvailable = String(donation.status || '').toUpperCase() === 'AVAILABLE';

  if (!isAvailable && !isDonor && !isAdmin && !isNGO) {
    throw new ApiError(403, 'Access denied to this donation');
  }

  return donation;
};


const updateDonation = async (id, user, updateData) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) {
    throw new ApiError(404, 'Food donation not found');
  }

  if (donation.donorId.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Only the donor can modify this donation');
  }

  Object.assign(donation, updateData);
  await donation.save();
  return donation;
};

const deleteDonation = async (id, user) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) {
    throw new ApiError(404, 'Food donation not found');
  }

  if (donation.donorId.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Only the donor can delete this donation');
  }

  await donation.deleteOne();
  return donation;
};

module.exports = {
  createDonation,
  listDonations,
  getDonationById,
  updateDonation,
  deleteDonation
};
