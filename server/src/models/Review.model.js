import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Reviews Collection
 * ------------------
 * Post-pickup feedback between donors and NGOs.
 * Linked to donations and requests to improve trust scores and AI history features.
 */

const reviewSchema = new Schema(
  {
    donationId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: [true, 'Donation reference is required'],
      index: true,
    },
    foodRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodRequest',
      required: [true, 'Food request reference is required'],
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer reference is required'],
      index: true,
    },
    revieweeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee reference is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flaggedReason: {
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

reviewSchema.index({ revieweeId: 1, createdAt: -1 });
reviewSchema.index({ donationId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ foodRequestId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });

reviewSchema.virtual('donation', {
  ref: 'FoodDonation',
  localField: 'donationId',
  foreignField: '_id',
  justOne: true,
});

reviewSchema.virtual('foodRequest', {
  ref: 'FoodRequest',
  localField: 'foodRequestId',
  foreignField: '_id',
  justOne: true,
});

reviewSchema.virtual('reviewer', {
  ref: 'User',
  localField: 'reviewerId',
  foreignField: '_id',
  justOne: true,
});

reviewSchema.virtual('reviewee', {
  ref: 'User',
  localField: 'revieweeId',
  foreignField: '_id',
  justOne: true,
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
