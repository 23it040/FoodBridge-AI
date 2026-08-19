const mongoose = require('mongoose');

const aiPredictionLogSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      enum: ['demand', 'risk', 'priority', 'recommendation', 'route'],
      required: true,
      index: true
    },
    modelVersion: {
      type: String,
      default: '1.0.0'
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodRequest',
      required: false
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: false
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'ERROR', 'INSUFFICIENT_DATA'],
      required: true,
      index: true
    },
    error: {
      type: String,
      default: null
    },
    inputAvailability: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

aiPredictionLogSchema.index({ modelName: 1, timestamp: -1 });
aiPredictionLogSchema.index({ modelName: 1, status: 1 });

const AIPredictionLog = mongoose.model('AIPredictionLog', aiPredictionLogSchema);

module.exports = { AIPredictionLog };
