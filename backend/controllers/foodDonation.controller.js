const foodDonationService = require('../services/foodDonation.service');
const cloudinaryService = require('../services/cloudinary.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const createDonation = async (req, res) => {
  let foodImage = {
    publicId: 'default_food',
    url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop'
  };

  if (req.file) {
    const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, 'foodbridge/donations');
    foodImage = {
      publicId: uploadResult.public_id || 'default_food',
      url: uploadResult.secure_url || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop'
    };
  }

  const donationData = {
    donorId: req.user._id,
    foodName: req.body.foodName,
    category: req.body.category || 'General',
    quantity: req.body.quantity || 1,
    unit: req.body.unit || 'servings',
    description: req.body.description || '',
    cookedTime: req.body.cookedTime || new Date(),
    expiryTime: req.body.expiryTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
    pickupAddress: req.body.pickupAddress || '',
    latitude: req.body.latitude || 28.6139,
    longitude: req.body.longitude || 77.2090,
    foodImage
  };

  const donation = await foodDonationService.createDonation(donationData);

  try {
    const { DonationLifecycleEvent } = require('../models/DonationLifecycleEvent.model');
    await DonationLifecycleEvent.logEvent({
      donationId: donation._id,
      eventType: 'DONATION_CREATED',
      actorId: req.user._id,
      actorRole: req.user.role === 'NGO' ? 'NGO' : req.user.role === 'ADMIN' ? 'ADMIN' : 'DONOR',
      location: donation.location || (donation.longitude && donation.latitude ? { type: 'Point', coordinates: [donation.longitude, donation.latitude] } : undefined),
      metadata: { category: donation.category, quantity: donation.quantity }
    });
  } catch (eventErr) {
    console.error('[DonationLifecycleEvent] Error logging DONATION_CREATED:', eventErr.message);
  }

  try {
    const notificationService = require('../services/notification.service');
    await notificationService.createNotification({
      recipientType: 'USER',
      recipientId: req.user._id,
      senderId: req.user._id,
      title: 'Food Donation Created',
      message: `Your food donation "${donation.foodName}" has been posted successfully.`,
      type: 'NEW_DONATION',
      data: { donationId: donation._id }
    });
    await notificationService.sendNearbyDonationNotification(donation, 50);
  } catch (notifErr) {
    console.error('Failed to dispatch donation creation notifications:', notifErr);
  }

  res.status(201).json(
    new ApiResponse({
      success: true,
      statusCode: 201,
      message: 'Food donation created successfully',
      data: donation
    })
  );
};

const listDonations = async (req, res) => {
  const donations = await foodDonationService.listDonations(req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food donations retrieved successfully',
      data: donations
    })
  );
};

const getDonation = async (req, res) => {
  const donation = await foodDonationService.getDonationById(req.params.id, req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food donation fetched successfully',
      data: donation
    })
  );
};

const updateDonation = async (req, res) => {
  const updateData = {};

  if (typeof req.body.foodName === 'string') updateData.foodName = req.body.foodName;
  if (typeof req.body.category === 'string') updateData.category = req.body.category;
  if (req.body.quantity !== undefined) updateData.quantity = req.body.quantity;
  if (typeof req.body.unit === 'string') updateData.unit = req.body.unit;
  if (typeof req.body.description === 'string') updateData.description = req.body.description;
  if (req.body.cookedTime) updateData.cookedTime = req.body.cookedTime;
  if (req.body.expiryTime) updateData.expiryTime = req.body.expiryTime;
  if (typeof req.body.pickupAddress === 'string') updateData.pickupAddress = req.body.pickupAddress;
  if (req.body.latitude !== undefined) updateData.latitude = req.body.latitude;
  if (req.body.longitude !== undefined) updateData.longitude = req.body.longitude;
  if (typeof req.body.status === 'string') updateData.status = req.body.status;

  if (req.file) {
    const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, 'foodbridge/donations');
    updateData.foodImage = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url
    };
  }

  const donation = await foodDonationService.updateDonation(req.params.id, req.user, updateData);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food donation updated successfully',
      data: donation
    })
  );
};

const deleteDonation = async (req, res) => {
  await foodDonationService.deleteDonation(req.params.id, req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Food donation deleted successfully'
    })
  );
};

module.exports = {
  createDonation,
  listDonations,
  getDonation,
  updateDonation,
  deleteDonation
};
