import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * AIRecommendations Collection
 * ----------------------------
 * Immutable snapshots of AI ranking results for each donation run.
 * Enables explainability, model evaluation, and audit without recomputation.
 */

const factorExplanationSchema = new Schema(
  {
    distanceKm: {
      type: Number,
      min: 0,
    },
    distanceScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    quantityMatch: {
      type: Number,
      min: 0,
      max: 1,
    },
    expiryUrgency: {
      type: Number,
      min: 0,
      max: 1,
    },
    demandAlignment: {
      type: Number,
      min: 0,
      max: 1,
    },
    historyScore: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const rankedNgoSchema = new Schema(
  {
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    explanation: {
      type: factorExplanationSchema,
      required: true,
    },
    wasSelected: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const inputFeaturesSchema = new Schema(
  {
    donationQuantity: Number,
    donationCategory: String,
    expiryHoursRemaining: Number,
    candidateNgoCount: Number,
    averageDistanceKm: Number,
  },
  { _id: false }
);

const aiRecommendationSchema = new Schema(
  {
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: [true, 'Donation reference is required'],
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    modelVersion: {
      type: String,
      required: [true, 'Model version is required'],
      trim: true,
    },
    modelType: {
      type: String,
      enum: ['rule_based', 'ml', 'hybrid'],
      default: 'rule_based',
    },
    inputFeatures: {
      type: inputFeaturesSchema,
      default: () => ({}),
    },
    rankedNgos: {
      type: [rankedNgoSchema],
      default: [],
      validate: {
        validator(list) {
          return list.length <= 50;
        },
        message: 'Cannot store more than 50 ranked NGOs per recommendation',
      },
    },
    selectedNgoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processingTimeMs: {
      type: Number,
      min: 0,
    },
    fallbackUsed: {
      type: Boolean,
      default: false,
    },
    fallbackReason: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

aiRecommendationSchema.index({ donationId: 1, createdAt: -1 });
aiRecommendationSchema.index({ modelVersion: 1, createdAt: -1 });
aiRecommendationSchema.index({ selectedNgoId: 1 });
aiRecommendationSchema.index({ 'rankedNgos.ngoId': 1 });

aiRecommendationSchema.virtual('donation', {
  ref: 'FoodDonation',
  localField: 'donationId',
  foreignField: '_id',
  justOne: true,
});

aiRecommendationSchema.virtual('requester', {
  ref: 'User',
  localField: 'requestedBy',
  foreignField: '_id',
  justOne: true,
});

aiRecommendationSchema.virtual('selectedNgo', {
  ref: 'User',
  localField: 'selectedNgoId',
  foreignField: '_id',
  justOne: true,
});

const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);

export default AIRecommendation;
