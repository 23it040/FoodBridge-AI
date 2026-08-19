import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import aiService from '../services/ai.service.js';
import cloudinaryService from '../services/cloudinary.service.js';

export const getRecommendations = asyncHandler(async (req, res) => {
  const recommendation = await aiService.getRecommendations(req.params.donationId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'AI recommendations generated', recommendation));
});

export const getRecommendationHistory = asyncHandler(async (req, res) => {
  const history = await aiService.getRecommendationHistory(req.params.donationId);
  res.status(200).json(new ApiResponse(200, 'Recommendation history fetched', history));
});

export const uploadImage = asyncHandler(async (req, res) => {
  const result = await cloudinaryService.uploadImage(req.file, req.body.folder || 'uploads');
  res.status(200).json(new ApiResponse(200, 'Image uploaded', result));
});

export const uploadImages = asyncHandler(async (req, res) => {
  const results = await cloudinaryService.uploadMultiple(req.files, req.body.folder || 'uploads');
  res.status(200).json(new ApiResponse(200, 'Images uploaded', results));
});
