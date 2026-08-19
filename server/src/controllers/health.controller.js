import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const healthCheck = asyncHandler(async (_req, res) => {
  res.status(200).json(
    new ApiResponse(200, 'FoodBridge AI API is running', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );
});
