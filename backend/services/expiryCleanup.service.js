const FoodDonation = require('../models/FoodDonation.model');
const FoodRequest = require('../models/FoodRequest.model');

/**
 * processExpiredDonations
 *
 * Automatically finds food donations where expiryTime <= now and status is still active
 * (AVAILABLE, REQUESTED, ACCEPTED), updates their status to EXPIRED, and cancels/expires
 * any corresponding active requests (PENDING, ACCEPTED, SCHEDULED).
 *
 * Preserves historical COMPLETED and PICKED_UP records for audit and reporting.
 */
const processExpiredDonations = async () => {
  try {
    const now = new Date();

    // 1. Find active donations that have reached or passed their expiryTime
    const expiredDonations = await FoodDonation.find({
      expiryTime: { $lte: now },
      status: { $in: ['AVAILABLE', 'REQUESTED', 'ACCEPTED'] }
    }).select('_id foodName donorId status expiryTime');

    if (!expiredDonations || expiredDonations.length === 0) {
      return { expiredCount: 0, pendingRequestsExpired: 0, acceptedRequestsExpired: 0 };
    }

    const expiredIds = expiredDonations.map((d) => d._id);

    // 2. Mark donations as EXPIRED
    await FoodDonation.updateMany(
      { _id: { $in: expiredIds } },
      { $set: { status: 'EXPIRED' } }
    );

    // 3. Find active PENDING requests for expired donations
    const pendingRequestsRes = await FoodRequest.updateMany(
      {
        foodId: { $in: expiredIds },
        status: 'PENDING'
      },
      { $set: { status: 'EXPIRED', rejectionReason: 'Food donation expired before pickup' } }
    );

    // 4. Find active ACCEPTED/SCHEDULED requests for expired donations
    const acceptedRequestsRes = await FoodRequest.updateMany(
      {
        foodId: { $in: expiredIds },
        status: { $in: ['ACCEPTED', 'SCHEDULED'] }
      },
      { $set: { status: 'EXPIRED', rejectionReason: 'Food donation expired before pickup' } }
    );

    // Log lifecycle events for audit trail
    try {
      const { DonationLifecycleEvent } = require('../models/DonationLifecycleEvent.model');
      for (const don of expiredDonations) {
        await DonationLifecycleEvent.logEvent({
          donationId: don._id,
          eventType: 'DONATION_EXPIRED',
          actorRole: 'SYSTEM',
          metadata: { foodName: don.foodName, expiredAt: now }
        });
      }
    } catch (e) {
      // Non-fatal event log error
    }

    const summary = {
      expiredCount: expiredDonations.length,
      pendingRequestsExpired: pendingRequestsRes.modifiedCount || 0,
      acceptedRequestsExpired: acceptedRequestsRes.modifiedCount || 0
    };

    console.log(
      `[EXPIRY CLEANUP] Expired donations: ${summary.expiredCount}, ` +
      `Pending requests expired: ${summary.pendingRequestsExpired}, ` +
      `Accepted requests expired: ${summary.acceptedRequestsExpired}`
    );

    return summary;
  } catch (err) {
    console.error('[EXPIRY CLEANUP ERROR]', err.message);
    return { error: err.message };
  }
};

let cleanupInterval = null;

/**
 * startExpiryCleanup
 *
 * Runs the expiry cleanup immediately on server startup (handling server restart scenario)
 * and schedules recurring execution every 1 minute.
 */
const startExpiryCleanup = () => {
  if (cleanupInterval) return;

  console.log('[EXPIRY CLEANUP SERVICE] Initializing automatic food expiry cleanup scheduler...');
  
  // 1. Run immediately on server start to handle any expirations during downtime
  processExpiredDonations();

  // 2. Schedule recurring run every 1 minute (60,000 ms)
  cleanupInterval = setInterval(() => {
    processExpiredDonations();
  }, 60 * 1000);
};

module.exports = {
  processExpiredDonations,
  startExpiryCleanup
};
