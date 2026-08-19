import mongoose from 'mongoose';
import { ANALYTICS_TYPES, ANALYTICS_PERIODS } from '../constants/enums.js';

const { Schema } = mongoose;

/**
 * Analytics Collection
 * --------------------
 * Pre-aggregated metrics snapshots for dashboards and reporting.
 * Avoids expensive runtime aggregations as donation volume grows.
 */

const platformMetricsSchema = new Schema(
  {
    totalUsers: { type: Number, default: 0, min: 0 },
    totalDonors: { type: Number, default: 0, min: 0 },
    totalNgos: { type: Number, default: 0, min: 0 },
    totalDonations: { type: Number, default: 0, min: 0 },
    activeDonations: { type: Number, default: 0, min: 0 },
    completedPickups: { type: Number, default: 0, min: 0 },
    expiredDonations: { type: Number, default: 0, min: 0 },
    cancelledDonations: { type: Number, default: 0, min: 0 },
    totalFoodSavedKg: { type: Number, default: 0, min: 0 },
    totalMealsSaved: { type: Number, default: 0, min: 0 },
    averagePickupTimeHours: { type: Number, default: 0, min: 0 },
    averageMatchScore: { type: Number, default: 0, min: 0, max: 100 },
    aiRecommendationsGenerated: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { _id: false }
);

const donorMetricsSchema = new Schema(
  {
    donationsCreated: { type: Number, default: 0, min: 0 },
    donationsDelivered: { type: Number, default: 0, min: 0 },
    donationsExpired: { type: Number, default: 0, min: 0 },
    successRate: { type: Number, default: 0, min: 0, max: 100 },
    mealsSaved: { type: Number, default: 0, min: 0 },
    foodSavedKg: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    topFoodCategory: { type: String, trim: true },
  },
  { _id: false }
);

const ngoMetricsSchema = new Schema(
  {
    demandsPosted: { type: Number, default: 0, min: 0 },
    pickupRequests: { type: Number, default: 0, min: 0 },
    pickupsCompleted: { type: Number, default: 0, min: 0 },
    pickupsRejected: { type: Number, default: 0, min: 0 },
    fulfillmentRate: { type: Number, default: 0, min: 0, max: 100 },
    foodReceivedKg: { type: Number, default: 0, min: 0 },
    beneficiariesServed: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    averageResponseTimeMinutes: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const analyticsSchema = new Schema(
  {
    analyticsType: {
      type: String,
      enum: Object.values(ANALYTICS_TYPES),
      required: [true, 'Analytics type is required'],
      index: true,
    },
    period: {
      type: String,
      enum: Object.values(ANALYTICS_PERIODS),
      required: [true, 'Analytics period is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    periodStart: {
      type: Date,
      required: [true, 'Period start date is required'],
      index: true,
    },
    periodEnd: {
      type: Date,
      required: [true, 'Period end date is required'],
    },
    metrics: {
      platform: platformMetricsSchema,
      donor: donorMetricsSchema,
      ngo: ngoMetricsSchema,
    },
    generatedBy: {
      type: String,
      enum: ['cron', 'manual', 'system'],
      default: 'cron',
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

analyticsSchema.index(
  { analyticsType: 1, period: 1, periodStart: -1 },
  { name: 'analytics_type_period_start' }
);

analyticsSchema.index(
  { analyticsType: 1, userId: 1, period: 1, periodStart: -1 },
  {
    unique: true,
    partialFilterExpression: {
      analyticsType: { $in: [ANALYTICS_TYPES.DONOR, ANALYTICS_TYPES.NGO] },
      userId: { $type: 'objectId' },
    },
  }
);

analyticsSchema.index(
  { analyticsType: ANALYTICS_TYPES.PLATFORM, period: 1, periodStart: -1 },
  {
    unique: true,
    partialFilterExpression: {
      analyticsType: ANALYTICS_TYPES.PLATFORM,
    },
  }
);

analyticsSchema.pre('save', function validateMetricsScope(next) {
  if (
    (this.analyticsType === ANALYTICS_TYPES.DONOR ||
      this.analyticsType === ANALYTICS_TYPES.NGO) &&
    !this.userId
  ) {
    next(new Error('Donor and NGO analytics require a userId reference'));
    return;
  }

  if (this.analyticsType === ANALYTICS_TYPES.PLATFORM && this.userId) {
    next(new Error('Platform analytics must not include userId'));
    return;
  }

  if (this.periodEnd <= this.periodStart) {
    next(new Error('periodEnd must be after periodStart'));
    return;
  }

  next();
});

analyticsSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
