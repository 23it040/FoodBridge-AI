const ngoService = require('../services/ngo.service');
const overpassService = require('../services/overpass.service');
const cloudinaryService = require('../services/cloudinary.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const registerNgo = async (req, res) => {
  const {
    organizationName,
    registrationNumber,
    email,
    password,
    phone,
    address,
    city,
    state,
    pincode,
    latitude,
    longitude
  } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'Profile image is required');
  }

  const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, 'foodbridge/ngos');

  const ngo = await ngoService.registerNgo({
    organizationName,
    registrationNumber,
    email,
    password,
    phone,
    address,
    city,
    state,
    pincode,
    latitude,
    longitude,
    profileImage: {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url
    }
  });

  res.status(201).json(
    new ApiResponse({
      success: true,
      statusCode: 201,
      message: 'NGO registration submitted successfully',
      data: ngo
    })
  );
};

const verifyNgo = async (req, res) => {
  const ngo = await ngoService.verifyNgo(req.params.id, req.user._id, req.body.verificationStatus);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'NGO verification status updated successfully',
      data: ngo
    })
  );
};

const getProfile = async (req, res) => {
  const ngo = await ngoService.getNgoProfile(req.user._id);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'NGO profile fetched successfully',
      data: ngo
    })
  );
};

const updateProfile = async (req, res) => {
  const updateData = {};

  if (req.body.organizationName) updateData.organizationName = req.body.organizationName;
  if (req.body.phone) updateData.phone = req.body.phone;
  if (req.body.address) updateData.address = req.body.address;
  if (req.body.city) updateData.city = req.body.city;
  if (req.body.state) updateData.state = req.body.state;
  if (req.body.pincode) updateData.pincode = req.body.pincode;
  if (req.body.latitude) updateData.latitude = req.body.latitude;
  if (req.body.longitude) updateData.longitude = req.body.longitude;

  if (req.file) {
    const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, 'foodbridge/ngos');
    updateData.profileImage = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url
    };
  }

  const ngo = await ngoService.updateNgoProfile(req.user._id, updateData);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'NGO profile updated successfully',
      data: ngo
    })
  );
};

const getDashboard = async (req, res) => {
  const stats = await ngoService.getDashboard(req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'NGO dashboard fetched successfully',
      data: stats
    })
  );
};

const getNearbyFood = async (req, res) => {
  const foods = await ngoService.findNearbyFood(req.user, req.query);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Nearby food fetched successfully',
      data: foods
    })
  );
};

const getHistory = async (req, res) => {
  const history = await ngoService.getHistory(req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'NGO history fetched successfully',
      data: history
    })
  );
};

const getNearbyNgos = async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    throw new ApiError(400, 'Latitude (lat) and longitude (lng) query parameters are required.');
  }

  const ngos = await overpassService.getNearbyNgosFromOverpass(lat, lng, radius);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Nearby NGOs fetched successfully from Overpass API',
      data: ngos
    })
  );
};

module.exports = {
  registerNgo,
  verifyNgo,
  getProfile,
  updateProfile,
  getDashboard,
  getNearbyFood,
  getHistory,
  getNearbyNgos
};
