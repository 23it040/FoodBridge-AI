const FoodDonation = require('../models/FoodDonation.model');
const ApiError = require('../utils/ApiError');

const createDonation = async (donationData) => {
  const donation = await FoodDonation.create(donationData);
  return donation;
};

const listDonations = async (user) => {
  if (user.role === 'admin') {
    return FoodDonation.find().populate('donorId', 'name email role');
  }

  return FoodDonation.find({
    $or: [{ status: 'AVAILABLE' }, { donorId: user._id }]
  }).populate('donorId', 'name email role');
};

const getDonationById = async (id, user) => {
  const donation = await FoodDonation.findById(id).populate('donorId', 'name email role');
  if (!donation) {
    throw new ApiError(404, 'Food donation not found');
  }

  if (donation.status !== 'AVAILABLE' && donation.donorId._id.toString() !== user._id.toString() && user.role !== 'admin') {
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
