const mongoose = require('mongoose');

const foodRequestSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: [true, 'Food donation reference is required']
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required']
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'NGO reference is required']
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    },
    requestMessage: {
      type: String,
      trim: true,
      maxlength: 500
    },
    pickupDate: {
      type: Date
    },
    pickupTime: {
      type: String,
      trim: true
    },
    completedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'food_requests'
  }
);

foodRequestSchema.index({ foodId: 1, ngoId: 1 }, { unique: true });
foodRequestSchema.index({ foodId: 1 });
foodRequestSchema.index({ donorId: 1 });
foodRequestSchema.index({ ngoId: 1 });
foodRequestSchema.index({ status: 1 });

const FoodRequest = mongoose.model('FoodRequest', foodRequestSchema);
module.exports = FoodRequest;
