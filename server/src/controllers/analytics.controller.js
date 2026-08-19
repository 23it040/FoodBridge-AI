import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import analyticsService from '../services/analytics.service.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getDashboard(req.user);
  res.status(200).json(new ApiResponse(200, 'Dashboard analytics fetched', analytics));
});

export const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getPlatformAnalytics(req.query.period);
  res.status(200).json(new ApiResponse(200, 'Platform analytics fetched', analytics));
});

export const getDonorAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getDonorAnalytics(req.user._id, req.query.period);
  res.status(200).json(new ApiResponse(200, 'Donor analytics fetched', analytics));
});

export const getNgoAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getNgoAnalytics(req.user._id, req.query.period);
  res.status(200).json(new ApiResponse(200, 'NGO analytics fetched', analytics));
});
