import { Analytics, FoodDonation, FoodRequest, User } from '../models/index.js';
import { USER_ROLES, DONATION_STATUS, REQUEST_STATUS, ANALYTICS_TYPES } from '../constants/enums.js';

class AnalyticsRepository {
  findLatest(filter) {
    return Analytics.findOne(filter).sort({ periodStart: -1 });
  }

  findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = '-periodStart' } = options;
    return Analytics.find(filter).sort(sort).skip(skip).limit(limit);
  }

  upsert(filter, data) {
    return Analytics.findOneAndUpdate(filter, data, {
      upsert: true,
      new: true,
      runValidators: true,
    });
  }

  async computePlatformMetrics() {
    const [
      totalUsers,
      totalDonors,
      totalNgos,
      totalDonations,
      activeDonations,
      completedPickups,
      expiredDonations,
      cancelledDonations,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: USER_ROLES.DONOR, isActive: true }),
      User.countDocuments({ role: USER_ROLES.NGO, isActive: true }),
      FoodDonation.countDocuments(),
      FoodDonation.countDocuments({ status: DONATION_STATUS.AVAILABLE }),
      FoodDonation.countDocuments({ status: DONATION_STATUS.DELIVERED }),
      FoodDonation.countDocuments({ status: DONATION_STATUS.EXPIRED }),
      FoodDonation.countDocuments({ status: DONATION_STATUS.CANCELLED }),
    ]);

    return {
      totalUsers,
      totalDonors,
      totalNgos,
      totalDonations,
      activeDonations,
      completedPickups,
      expiredDonations,
      cancelledDonations,
    };
  }

  async computeDonorMetrics(userId) {
    const [created, delivered, expired] = await Promise.all([
      FoodDonation.countDocuments({ donorId: userId }),
      FoodDonation.countDocuments({ donorId: userId, status: DONATION_STATUS.DELIVERED }),
      FoodDonation.countDocuments({ donorId: userId, status: DONATION_STATUS.EXPIRED }),
    ]);

    const successRate = created > 0 ? Math.round((delivered / created) * 100) : 0;

    return {
      donationsCreated: created,
      donationsDelivered: delivered,
      donationsExpired: expired,
      successRate,
    };
  }

  async computeNgoMetrics(userId) {
    const [demandsPosted, pickupRequests, pickupsCompleted, pickupsRejected] = await Promise.all([
      FoodRequest.countDocuments({ ngoId: userId, requestType: 'demand' }),
      FoodRequest.countDocuments({ ngoId: userId, requestType: 'pickup' }),
      FoodRequest.countDocuments({ ngoId: userId, status: REQUEST_STATUS.COMPLETED }),
      FoodRequest.countDocuments({ ngoId: userId, status: REQUEST_STATUS.REJECTED }),
    ]);

    const fulfillmentRate =
      pickupRequests > 0 ? Math.round((pickupsCompleted / pickupRequests) * 100) : 0;

    return {
      demandsPosted,
      pickupRequests,
      pickupsCompleted,
      pickupsRejected,
      fulfillmentRate,
    };
  }
}

export default new AnalyticsRepository();
