import ApiError from '../utils/ApiError.js';
import { buildPagination, getPaginationParams } from '../utils/helpers.js';
import reviewRepository from '../repositories/review.repository.js';
import donationRepository from '../repositories/donation.repository.js';
import requestRepository from '../repositories/request.repository.js';
import userRepository from '../repositories/user.repository.js';
import notificationService from './notification.service.js';
import { DONATION_STATUS, REQUEST_STATUS, NOTIFICATION_TYPES } from '../constants/enums.js';

const defaultPopulate = [
  { path: 'reviewerId', select: 'email role profile.organizationName profile.avatar' },
  { path: 'revieweeId', select: 'email role profile.organizationName profile.avatar' },
  { path: 'donationId', select: 'title category' },
  { path: 'foodRequestId', select: 'requestType status' },
];

class ReviewService {
  async create(reviewerId, payload) {
    const [donation, foodRequest, reviewee] = await Promise.all([
      donationRepository.findById(payload.donationId),
      requestRepository.findById(payload.foodRequestId),
      userRepository.findById(payload.revieweeId),
    ]);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    if (!foodRequest) {
      throw ApiError.notFound('Food request not found');
    }

    if (!reviewee) {
      throw ApiError.notFound('Reviewee not found');
    }

    if (donation.status !== DONATION_STATUS.DELIVERED) {
      throw ApiError.badRequest('Reviews can only be submitted for completed donations');
    }

    if (foodRequest.status !== REQUEST_STATUS.COMPLETED) {
      throw ApiError.badRequest('Food request must be completed before reviewing');
    }

    if (payload.revieweeId === reviewerId.toString()) {
      throw ApiError.badRequest('You cannot review yourself');
    }

    const isParticipant =
      donation.donorId.toString() === reviewerId.toString() ||
      foodRequest.ngoId.toString() === reviewerId.toString();

    if (!isParticipant) {
      throw ApiError.forbidden('Only donation participants can submit reviews');
    }

    const review = await reviewRepository.create({
      ...payload,
      reviewerId,
    });

    const [ratingStats] = await reviewRepository.getAverageRating(payload.revieweeId);

    if (ratingStats) {
      await userRepository.updateById(payload.revieweeId, {
        'profile.stats.averageRating': Math.round(ratingStats.averageRating * 10) / 10,
        'profile.stats.totalReviews': ratingStats.totalReviews,
      });
    }

    await notificationService.create({
      userId: payload.revieweeId,
      type: NOTIFICATION_TYPES.REVIEW,
      title: 'New Review Received',
      message: `You received a ${payload.rating}-star review.`,
      metadata: { reviewId: review._id, donationId: payload.donationId },
    });

    return reviewRepository.findById(review._id, defaultPopulate);
  }

  async getById(id) {
    const review = await reviewRepository.findById(id, defaultPopulate);

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    return review;
  }

  async list(query) {
    const { page, limit, skip } = getPaginationParams(query);
    const filter = { isPublic: true };

    if (query.revieweeId) filter.revieweeId = query.revieweeId;
    if (query.donationId) filter.donationId = query.donationId;

    const [reviews, total] = await Promise.all([
      reviewRepository.findAll(filter, { skip, limit, populate: defaultPopulate }),
      reviewRepository.count(filter),
    ]);

    return {
      reviews,
      pagination: buildPagination(page, limit, total),
    };
  }
}

export default new ReviewService();
