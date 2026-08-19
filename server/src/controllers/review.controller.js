import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import reviewService from '../services/review.service.js';

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.create(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, 'Review submitted', review));
});

export const getReview = asyncHandler(async (req, res) => {
  const review = await reviewService.getById(req.params.id);
  res.status(200).json(new ApiResponse(200, 'Review fetched', review));
});

export const listReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.list(req.query);
  res.status(200).json(new ApiResponse(200, 'Reviews fetched', result.reviews, result.pagination));
});
