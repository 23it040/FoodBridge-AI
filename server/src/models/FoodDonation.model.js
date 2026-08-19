import mongoose from 'mongoose';
import {
  FOOD_CATEGORIES,
  QUANTITY_UNITS,
  DONATION_STATUS,
} from '../constants/enums.js';

const { Schema } = mongoose;

/**
 * FoodDonations Collection
 * ------------------------
 * Stores every food surplus listing created by donors.
 * Geospatial index enables nearby-donation queries for NGOs and AI ranking.
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
      required: [true, 'Pickup location coordinates are required'],
      validate: {
        validator(coords) {
          return (
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90
          );
        },
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false }
);

const pickupWindowSchema = new Schema(
  {
    start: {
      type: Date,
      required: [true, 'Pickup window start is required'],
    },
    end: {
      type: Date,
      required: [true, 'Pickup window end is required'],
    },
  },
  { _id: false }
);

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const recommendedNgoSchema = new Schema(
  {
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    rank: {
      type: Number,
      min: 1,
    },
  },
  { _id: false }
);

const foodDonationSchema = new Schema(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Donation title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    foodType: {
      type: String,
      required: [true, 'Food type is required'],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: Object.values(FOOD_CATEGORIES),
      required: [true, 'Food category is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      enum: Object.values(QUANTITY_UNITS),
      required: [true, 'Quantity unit is required'],
    },
    servingsEstimate: {
      type: Number,
      min: 0,
    },
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
      index: true,
    },
    pickupWindow: {
      type: pickupWindowSchema,
      required: [true, 'Pickup window is required'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Pickup location is required'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.AVAILABLE,
      index: true,
    },
    assignedNgoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    aiRecommendedNgos: {
      type: [recommendedNgoSchema],
      default: [],
    },
    latestRecommendationId: {
      type: Schema.Types.ObjectId,
      ref: 'AIRecommendation',
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isPerishable: {
      type: Boolean,
      default: true,
    },
    storageInstructions: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

foodDonationSchema.index({ location: '2dsphere' });
foodDonationSchema.index({ donorId: 1, status: 1, createdAt: -1 });
foodDonationSchema.index({ status: 1, expiryTime: 1 });
foodDonationSchema.index({ assignedNgoId: 1, status: 1 });
foodDonationSchema.index({ category: 1, status: 1 });
foodDonationSchema.index({ createdAt: -1 });

foodDonationSchema.pre('save', function validatePickupWindow(next) {
  if (
    this.pickupWindow?.start &&
    this.pickupWindow?.end &&
    this.pickupWindow.end <= this.pickupWindow.start
  ) {
    next(new Error('Pickup window end must be after start'));
    return;
  }

  if (this.expiryTime && this.pickupWindow?.end && this.expiryTime < this.pickupWindow.end) {
    next(new Error('Expiry time must be after pickup window end'));
    return;
  }

  next();
});

foodDonationSchema.virtual('donor', {
  ref: 'User',
  localField: 'donorId',
  foreignField: '_id',
  justOne: true,
});

foodDonationSchema.virtual('assignedNgo', {
  ref: 'User',
  localField: 'assignedNgoId',
  foreignField: '_id',
  justOne: true,
});

foodDonationSchema.virtual('foodRequests', {
  ref: 'FoodRequest',
  localField: '_id',
  foreignField: 'donationId',
});

foodDonationSchema.virtual('aiRecommendations', {
  ref: 'AIRecommendation',
  localField: '_id',
  foreignField: 'donationId',
});

foodDonationSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'donationId',
});

const FoodDonation = mongoose.model('FoodDonation', foodDonationSchema);

export default FoodDonation;
