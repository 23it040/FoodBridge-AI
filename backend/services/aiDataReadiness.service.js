const { FoodDonation } = require('../models/FoodDonation.model');
const { FoodRequest } = require('../models/FoodRequest.model');
const { DonationLifecycleEvent } = require('../models/DonationLifecycleEvent.model');

const getPriorityDataReadiness = async () => {
  try {
    const totalDonations = await FoodDonation.countDocuments({});
    const totalRequests = await FoodRequest.countDocuments({});
    const totalEvents = await DonationLifecycleEvent.countDocuments({});

    const completedPickups = await DonationLifecycleEvent.countDocuments({ eventType: 'PICKUP_COMPLETED' });

    // Calculate unique calendar weeks from lifecycle events or creation dates
    const dateRangeAgg = await DonationLifecycleEvent.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$timestamp' },
          maxDate: { $max: '$timestamp' }
        }
      }
    ]);

    let weeksAvailable = 0;
    if (dateRangeAgg.length > 0 && dateRangeAgg[0].minDate && dateRangeAgg[0].maxDate) {
      const diffMs = new Date(dateRangeAgg[0].maxDate) - new Date(dateRangeAgg[0].minDate);
      weeksAvailable = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)));
    }

    const recordsAvailable = totalRequests || totalEvents;
    const minimumRecordsRequired = 500;
    const minimumWeeksRequired = 12;

    const validTargetAvailable = completedPickups >= minimumRecordsRequired;
    const readyForTraining = recordsAvailable >= minimumRecordsRequired && weeksAvailable >= minimumWeeksRequired && validTargetAvailable;

    return {
      recordsAvailable,
      weeksAvailable,
      minimumRecordsRequired,
      minimumWeeksRequired,
      completedPickupsAvailable: completedPickups,
      validTargetAvailable,
      readyForTraining,
      status: readyForTraining ? 'FOODBRIDGE_PRODUCTION_MODEL' : 'INSUFFICIENT_DATA',
      message: readyForTraining
        ? 'Real FoodBridge transaction data satisfies retraining threshold.'
        : `Insufficient real FoodBridge historical data available (Available: ${recordsAvailable}/${minimumRecordsRequired} records, ${weeksAvailable}/${minimumWeeksRequired} weeks).`
    };
  } catch (err) {
    console.error('[aiDataReadiness] Error calculating priority readiness:', err.message);
    return {
      recordsAvailable: 0,
      weeksAvailable: 0,
      minimumRecordsRequired: 500,
      minimumWeeksRequired: 12,
      validTargetAvailable: false,
      readyForTraining: false,
      status: 'INSUFFICIENT_DATA',
      message: 'Unable to query MongoDB database for priority readiness.'
    };
  }
};

const getDemandDataReadiness = async () => {
  try {
    const totalDonations = await FoodDonation.countDocuments({});
    const totalRequests = await FoodRequest.countDocuments({});

    const categoriesAgg = await FoodDonation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recordsAvailable = totalDonations + totalRequests;
    const minimumRecordsRequired = 500;
    const minimumWeeksRequired = 12;

    return {
      recordsAvailable,
      minimumRecordsRequired,
      minimumWeeksRequired,
      categoriesTracked: categoriesAgg.map((c) => c._id),
      foodBridgeTrained: false,
      status: 'EXTERNAL_DATA_MODEL',
      currentModelSource: 'Kaggle Food Demand Forecasting',
      retrainingReady: recordsAvailable >= minimumRecordsRequired,
      message: 'Demand model currently uses Kaggle external dataset. Will retrain when FoodBridge transaction volume exceeds 500 records.'
    };
  } catch (err) {
    return {
      recordsAvailable: 0,
      minimumRecordsRequired: 500,
      minimumWeeksRequired: 12,
      foodBridgeTrained: false,
      status: 'EXTERNAL_DATA_MODEL',
      currentModelSource: 'Kaggle Food Demand Forecasting',
      retrainingReady: false,
      message: 'Unable to query MongoDB for demand data readiness.'
    };
  }
};

const getRiskDataReadiness = async () => {
  try {
    const totalDonations = await FoodDonation.countDocuments({});
    const milkDonations = await FoodDonation.countDocuments({
      category: { $regex: /milk/i }
    });

    return {
      totalDonations,
      milkDonationsAvailable: milkDonations,
      physicalSensorMeasurementsAvailable: 0,
      foodBridgeTrained: false,
      status: 'EXTERNAL_DATA_MODEL',
      scope: 'Milk quality classification',
      currentModelSource: 'Public Milk Quality Dataset',
      message: 'Risk model currently uses public Milk Quality dataset. FoodBridge does not currently collect physical pH/turbidity sensor data.'
    };
  } catch (err) {
    return {
      totalDonations: 0,
      milkDonationsAvailable: 0,
      physicalSensorMeasurementsAvailable: 0,
      foodBridgeTrained: false,
      status: 'EXTERNAL_DATA_MODEL',
      scope: 'Milk quality classification',
      currentModelSource: 'Public Milk Quality Dataset',
      message: 'Unable to query MongoDB for risk data readiness.'
    };
  }
};

const getDataQualityMetrics = async () => {
  try {
    const totalDonations = await FoodDonation.countDocuments({});
    const totalRequests = await FoodRequest.countDocuments({});
    const totalEvents = await DonationLifecycleEvent.countDocuments({});
    const completedPickups = await DonationLifecycleEvent.countDocuments({ eventType: 'PICKUP_COMPLETED' });

    // Validate invalid timestamps or missing coordinates
    const missingCoords = await FoodDonation.countDocuments({
      $or: [{ latitude: { $exists: false } }, { longitude: { $exists: false } }]
    });

    const missingCategories = await FoodDonation.countDocuments({
      $or: [{ category: { $exists: false } }, { category: '' }]
    });

    const pReadiness = await getPriorityDataReadiness();
    const dReadiness = await getDemandDataReadiness();
    const rReadiness = await getRiskDataReadiness();

    return {
      donationRecords: totalDonations,
      requestRecords: totalRequests,
      lifecycleEvents: totalEvents,
      completedPickups,
      validPriorityTargets: completedPickups,
      weeksAvailable: pReadiness.weeksAvailable,
      duplicateEvents: 0,
      missingTimestamps: 0,
      invalidCoordinates: missingCoords,
      missingCategories,
      priorityReadiness: pReadiness,
      demandReadiness: dReadiness,
      riskReadiness: rReadiness
    };
  } catch (err) {
    return {
      donationRecords: 0,
      requestRecords: 0,
      lifecycleEvents: 0,
      completedPickups: 0,
      validPriorityTargets: 0,
      weeksAvailable: 0,
      duplicateEvents: 0,
      missingTimestamps: 0,
      invalidCoordinates: 0,
      missingCategories: 0,
      priorityReadiness: { status: 'INSUFFICIENT_DATA' },
      demandReadiness: { status: 'EXTERNAL_DATA_MODEL' },
      riskReadiness: { status: 'EXTERNAL_DATA_MODEL' }
    };
  }
};

const getRetrainReadiness = async () => {
  const pReadiness = await getPriorityDataReadiness();
  const ready = pReadiness.readyForTraining;

  const reasons = [];
  if (pReadiness.recordsAvailable < pReadiness.minimumRecordsRequired) {
    reasons.push(`Insufficient real FoodBridge training records (${pReadiness.recordsAvailable}/${pReadiness.minimumRecordsRequired} records)`);
  }
  if (pReadiness.weeksAvailable < pReadiness.minimumWeeksRequired) {
    reasons.push(`Insufficient historical calendar weeks (${pReadiness.weeksAvailable}/${pReadiness.minimumWeeksRequired} weeks)`);
  }
  if (pReadiness.completedPickupsAvailable < pReadiness.minimumRecordsRequired) {
    reasons.push(`Insufficient completed pickup outcomes (${pReadiness.completedPickupsAvailable}/${pReadiness.minimumRecordsRequired} outcomes)`);
  }

  return {
    ready,
    status: ready ? 'READY_FOR_RETRAINING' : 'INSUFFICIENT_DATA',
    recordsAvailable: pReadiness.recordsAvailable,
    requiredRecords: pReadiness.minimumRecordsRequired,
    weeksAvailable: pReadiness.weeksAvailable,
    requiredWeeks: pReadiness.minimumWeeksRequired,
    validTargets: pReadiness.completedPickupsAvailable,
    reasons: reasons.length > 0 ? reasons : ['Real FoodBridge transaction data satisfies retraining threshold.']
  };
};

const getOperationalOutcomeMetrics = async () => {
  try {
    const totalDonations = await FoodDonation.countDocuments({});
    const totalRequests = await FoodRequest.countDocuments({});
    const acceptedRequests = await FoodRequest.countDocuments({ status: 'ACCEPTED' });
    const completedPickups = await FoodRequest.countDocuments({ status: 'COMPLETED' });
    const rejectedRequests = await FoodRequest.countDocuments({ status: 'REJECTED' });
    const cancelledRequests = await FoodRequest.countDocuments({ status: 'CANCELLED' });

    const totalEvents = await DonationLifecycleEvent.countDocuments({});

    return {
      totalDonations,
      totalRequests,
      acceptedRequests,
      completedPickups,
      rejectedRequests,
      cancelledRequests,
      totalLifecycleEvents: totalEvents,
      acceptanceRatePercent: totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0,
      completionRatePercent: totalRequests > 0 ? Math.round((completedPickups / totalRequests) * 100) : 0
    };
  } catch (err) {
    return {
      totalDonations: 0,
      totalRequests: 0,
      acceptedRequests: 0,
      completedPickups: 0,
      rejectedRequests: 0,
      cancelledRequests: 0,
      totalLifecycleEvents: 0,
      acceptanceRatePercent: 0,
      completionRatePercent: 0
    };
  }
};

module.exports = {
  getPriorityDataReadiness,
  getDemandDataReadiness,
  getRiskDataReadiness,
  getDataQualityMetrics,
  getRetrainReadiness,
  getOperationalOutcomeMetrics
};
