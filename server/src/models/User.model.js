import mongoose from 'mongoose';
import {
  USER_ROLES,
  DONOR_TYPES,
  VERIFICATION_STATUS,
} from '../constants/enums.js';

const { Schema } = mongoose;

/**
 * Users Collection
 * ----------------
 * Central identity store for all platform actors (donors, NGOs, admins, volunteers).
 * Profile data is embedded to avoid joins on every auth/profile read while keeping
 * a single source of truth for authentication and role-based access.
 */

const addressSchema = new Schema(
  {
    street: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: 100,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      maxlength: 10,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
      maxlength: 100,
    },
  },
  { _id: false }
);

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: [true, 'Geo coordinates [longitude, latitude] are required'],
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
        message: 'Coordinates must be [longitude, latitude] within valid ranges',
      },
    },
  },
  { _id: false }
);

const documentSchema = new Schema(
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
    type: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const operatingHoursSchema = new Schema(
  {
    open: {
      type: String,
      trim: true,
    },
    close: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const userStatsSchema = new Schema(
  {
    totalDonations: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPickups: {
      type: Number,
      default: 0,
      min: 0,
    },
    mealsSaved: {
      type: Number,
      default: 0,
      min: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: [true, 'User role is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
    profile: {
      organizationName: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      contactPerson: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      phone: {
        type: String,
        trim: true,
        maxlength: 15,
      },
      avatar: {
        url: String,
        publicId: String,
      },
      address: addressSchema,
      location: locationSchema,
      donorType: {
        type: String,
        enum: Object.values(DONOR_TYPES),
      },
      fssaiLicense: {
        type: String,
        trim: true,
      },
      registrationNumber: {
        type: String,
        trim: true,
      },
      serviceRadiusKm: {
        type: Number,
        min: 1,
        max: 100,
        default: 15,
      },
      capacityPerDay: {
        type: Number,
        min: 0,
      },
      preferredFoodTypes: [
        {
          type: String,
          trim: true,
        },
      ],
      operatingHours: operatingHoursSchema,
      verificationStatus: {
        type: String,
        enum: Object.values(VERIFICATION_STATUS),
        default: VERIFICATION_STATUS.PENDING,
      },
      verificationNote: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      documents: [documentSchema],
      stats: {
        type: userStatsSchema,
        default: () => ({}),
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'profile.verificationStatus': 1 });
userSchema.index({ 'profile.location': '2dsphere' });
userSchema.index({ role: 1, 'profile.verificationStatus': 1 });

userSchema.virtual('donations', {
  ref: 'FoodDonation',
  localField: '_id',
  foreignField: 'donorId',
});

userSchema.virtual('foodRequests', {
  ref: 'FoodRequest',
  localField: '_id',
  foreignField: 'ngoId',
});

userSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.virtual('reviewsGiven', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'reviewerId',
});

userSchema.virtual('reviewsReceived', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'revieweeId',
});

const User = mongoose.model('User', userSchema);

export default User;
