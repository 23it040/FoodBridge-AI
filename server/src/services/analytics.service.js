import ApiError from '../utils/ApiError.js';
import analyticsRepository from '../repositories/analytics.repository.js';
import { USER_ROLES, ANALYTICS_TYPES, ANALYTICS_PERIODS } from '../constants/enums.js';

class AnalyticsService {
  getPeriodBounds(period = ANALYTICS_PERIODS.DAILY) {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);

    switch (period) {
      case ANALYTICS_PERIODS.WEEKLY:
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case ANALYTICS_PERIODS.MONTHLY:
        periodStart.setMonth(periodStart.getMonth() - 1);
        break;
      default:
        periodStart.setDate(periodStart.getDate() - 1);
    }

    return { periodStart, periodEnd: now, period };
  }

  async getPlatformAnalytics(period = ANALYTICS_PERIODS.DAILY) {
    const bounds = this.getPeriodBounds(period);
    const metrics = await analyticsRepository.computePlatformMetrics();

    const snapshot = await analyticsRepository.upsert(
      {
        analyticsType: ANALYTICS_TYPES.PLATFORM,
        period: bounds.period,
        periodStart: bounds.periodStart,
      },
      {
        analyticsType: ANALYTICS_TYPES.PLATFORM,
        period: bounds.period,
        periodStart: bounds.periodStart,
        periodEnd: bounds.periodEnd,
        metrics: { platform: metrics },
        generatedBy: 'system',
      }
    );

    return snapshot;
  }

  async getDonorAnalytics(userId, period = ANALYTICS_PERIODS.DAILY) {
    const bounds = this.getPeriodBounds(period);
    const metrics = await analyticsRepository.computeDonorMetrics(userId);

    const snapshot = await analyticsRepository.upsert(
      {
        analyticsType: ANALYTICS_TYPES.DONOR,
        userId,
        period: bounds.period,
        periodStart: bounds.periodStart,
      },
      {
        analyticsType: ANALYTICS_TYPES.DONOR,
        userId,
        period: bounds.period,
        periodStart: bounds.periodStart,
        periodEnd: bounds.periodEnd,
        metrics: { donor: metrics },
        generatedBy: 'system',
      }
    );

    return snapshot;
  }

  async getNgoAnalytics(userId, period = ANALYTICS_PERIODS.DAILY) {
    const bounds = this.getPeriodBounds(period);
    const metrics = await analyticsRepository.computeNgoMetrics(userId);

    const snapshot = await analyticsRepository.upsert(
      {
        analyticsType: ANALYTICS_TYPES.NGO,
        userId,
        period: bounds.period,
        periodStart: bounds.periodStart,
      },
      {
        analyticsType: ANALYTICS_TYPES.NGO,
        userId,
        period: bounds.period,
        periodStart: bounds.periodStart,
        periodEnd: bounds.periodEnd,
        metrics: { ngo: metrics },
        generatedBy: 'system',
      }
    );

    return snapshot;
  }

  async getDashboard(user) {
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return this.getPlatformAnalytics();
      case USER_ROLES.DONOR:
        return this.getDonorAnalytics(user._id);
      case USER_ROLES.NGO:
        return this.getNgoAnalytics(user._id);
      default:
        throw ApiError.forbidden('Analytics not available for this role');
    }
  }
}

export default new AnalyticsService();
