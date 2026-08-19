const userService = require('../services/user.service');
const cloudinaryService = require('../services/cloudinary.service');
const ApiResponse = require('../utils/ApiResponse');

const getProfile = async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'User profile fetched successfully',
      data: user
    })
  );
};

const updateProfile = async (req, res) => {
  const updateData = {};

  if (typeof req.body.name === 'string' && req.body.name.trim()) {
    updateData.name = req.body.name.trim();
  }
  if (typeof req.body.phone === 'string') {
    updateData.phone = req.body.phone.trim();
  }
  if (typeof req.body.address === 'string') {
    updateData.address = req.body.address.trim();
  }

  if (req.file) {
    const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, 'foodbridge/users');
    updateData.avatar = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url
    };
  }

  const user = await userService.updateUser(req.user._id, updateData);

  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'User profile updated successfully',
      data: user
    })
  );
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);

  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Password changed successfully'
    })
  );
};

const deleteAccount = async (req, res) => {
  await userService.deleteUserAccount(req.user._id);

  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Account deleted successfully'
    })
  );
};

const getDonorDashboard = async (req, res) => {
  const data = await userService.getDonorDashboard(req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Donor dashboard metrics retrieved successfully',
      data
    })
  );
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getDonorDashboard
};
