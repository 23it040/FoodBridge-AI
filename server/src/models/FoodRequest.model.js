import mongoose from 'mongoose';
import {
  REQUEST_TYPES,
  REQUEST_STATUS,
  URGENCY_LEVELS,
  QUANTITY_UNITS,
} from '../constants/enums.js';

const { Schema } = mongoose;

/**
 * FoodRequests Collection
 * ---------------------
 * Unified request workflow for NGOs:
 *  - demand: NGO posts current food need
 *  - pickup: NGO requests to collect a specific donation
 */

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: [true, 'Request location coordinates are required'],
    },
  },
  { _id: false }
);

const statusTimelineSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const foodRequestSchema = new Schema(
  {
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'NGO reference is required'],
      index: true,
    },
    requestType: {
      type: String,
      enum: Object.values(REQUEST_TYPES),
      required: [true, 'Request type is required'],
      index: true,
    },
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodDonation',
      default: null,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    foodCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    quantityNeeded: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      enum: Object.values(QUANTITY_UNITS),
    },
    urgency: {
      type: String,
      enum: Object.values(URGENCY_LEVELS),
      default: URGENCY_LEVELS.MEDIUM,
    },
    location: {
      type: locationSchema,
      required: [true, 'Request location is required'],
    },
    validUntil: {
      type: Date,
      index: true,
    },
    scheduledPickupAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
      index: true,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: {
      type: Date,
    },
    responseNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    handoverOtp: {
      type: String,
      select: false,
    },
    handoverOtpExpiresAt: {
      type: Date,
      select: false,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    statusTimeline: {
      type: [statusTimelineSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

foodRequestSchema.index({ location: '2dsphere' });
foodRequestSchema.index({ ngoId: 1, requestType: 1, status: 1 });
foodRequestSchema.index({ donationId: 1, status: 1 });
foodRequestSchema.index({ requestType: 1, isActive: 1, urgency: 1 });
foodRequestSchema.index({ status: 1, validUntil: 1 });
foodRequestSchema.index(
  { donationId: 1, ngoId: 1, requestType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      requestType: REQUEST_TYPES.PICKUP,
      status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.ACCEPTED] },
    },
  }
);

foodRequestSchema.pre('save', function validateRequestType(next) {
  if (this.requestType === REQUEST_TYPES.PICKUP && !this.donationId) {
    next(new Error('Pickup requests must reference a donationId'));
    return;
  }

  if (this.requestType === REQUEST_TYPES.DEMAND && !this.validUntil) {
    next(new Error('Demand requests must include validUntil'));
    return;
  }

  next();
});

foodRequestSchema.virtual('ngo', {
  ref: 'User',
  localField: 'ngoId',
  foreignField: '_id',
  justOne: true,
});

foodRequestSchema.virtual('donation', {
  ref: 'FoodDonation',
  localField: 'donationId',
  foreignField: '_id',
  justOne: true,
});

foodRequestSchema.virtual('responder', {
  ref: 'User',
  localField: 'respondedBy',
  foreignField: '_id',
  justOne: true,
});

foodRequestSchema.virtual('review', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'foodRequestId',
  justOne: true,
});

const FoodRequest = mongoose.model('FoodRequest', foodRequestSchema);

export default FoodRequest;
