import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import userService from '../services/user.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, 'Profile fetched', user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, 'Profile updated', user));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await userService.uploadAvatar(req.user._id, req.file);
  res.status(200).json(new ApiResponse(200, 'Avatar uploaded', user));
});

export const uploadDocument = asyncHandler(async (req, res) => {
  const user = await userService.uploadDocument(
    req.user._id,
    req.file,
    req.body.documentType || 'verification'
  );
  res.status(200).json(new ApiResponse(200, 'Document uploaded', user));
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(200).json(new ApiResponse(200, 'Users fetched', result.users, result.pagination));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'User fetched', user));
});

export const updateVerificationStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateVerificationStatus(
    req.user._id,
    req.params.id,
    req.body
  );
  res.status(200).json(new ApiResponse(200, 'Verification status updated', user));
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, 'User deactivated', user));
});
