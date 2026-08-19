const mongoose = require('mongoose');

const LIFECYCLE_EVENT_TYPES = [
  'DONATION_CREATED',
  'DONATION_UPDATED',
  'DONATION_CANCELLED',
  'DONATION_EXPIRED',
  'REQUEST_CREATED',
  'REQUEST_ACCEPTED',
  'REQUEST_REJECTED',
  'REQUEST_CANCELLED',
  'PICKUP_SCHEDULED',
  'PICKUP_STARTED',
  'PICKUP_COMPLETED',
  'DONATION_DISTRIBUTED'
];

const donationLifecycleEventSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: true,
      index: true
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodRequest',
      required: false,
      index: true
    },
    eventType: {
      type: String,
      enum: LIFECYCLE_EVENT_TYPES,
      required: true,
      index: true
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    actorRole: {
      type: String,
      enum: ['DONOR', 'NGO', 'ADMIN', 'SYSTEM'],
      default: 'SYSTEM'
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false
      }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for temporal sequence queries and idempotency checks
donationLifecycleEventSchema.index({ donationId: 1, timestamp: 1 });
donationLifecycleEventSchema.index({ eventType: 1, timestamp: 1 });
donationLifecycleEventSchema.index({ donationId: 1, eventType: 1 });
donationLifecycleEventSchema.index({ requestId: 1, eventType: 1 });

/**
 * Idempotent event creation helper to prevent duplicate lifecycle events
 */
donationLifecycleEventSchema.statics.logEvent = async function (eventData) {
  try {
    const { donationId, requestId, eventType, actorId, actorRole, ngoId, location, metadata } = eventData;

    // Idempotency check for single-instance events (e.g., DONATION_CREATED, REQUEST_CREATED, PICKUP_COMPLETED)
    const singleOccurrenceEvents = ['DONATION_CREATED', 'REQUEST_CREATED', 'PICKUP_COMPLETED', 'DONATION_DISTRIBUTED'];
    if (singleOccurrenceEvents.includes(eventType)) {
      const query = { donationId, eventType };
      if (requestId) query.requestId = requestId;
      const existing = await this.findOne(query);
      if (existing) {
        return existing; // Return existing without creating duplicate
      }
    }

    const newEvent = new this({
      donationId,
      requestId,
      eventType,
      actorId,
      actorRole: actorRole || 'SYSTEM',
      ngoId,
      location,
      metadata: metadata || {}
    });

    return await newEvent.save();
  } catch (err) {
    console.error(`[DonationLifecycleEvent] Error logging lifecycle event ${eventData?.eventType}:`, err.message);
    return null;
  }
};

const DonationLifecycleEvent = mongoose.model('DonationLifecycleEvent', donationLifecycleEventSchema);

module.exports = {
  DonationLifecycleEvent,
  LIFECYCLE_EVENT_TYPES
};
