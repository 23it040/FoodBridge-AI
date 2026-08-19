const { FoodDonation } = require('../models/FoodDonation.model');
const aiService = require('./ai.service');
const aiGovernanceService = require('./aiGovernance.service');
const aiDataReadinessService = require('./aiDataReadiness.service');

/**
 * AI Decision Orchestrator Service
 * Orchestrates existing AI capabilities (Demand, Risk, Recommendation, Priority, Route)
 * with strict Error Isolation: failure in one capability returns insufficientData cleanly
 * without breaking the rest of the operational response.
 */
const getAiDecisionForDonation = async (donationId, reqUser = null, options = {}) => {
  let donation = null;
  if (donationId) {
    try {
      donation = await FoodDonation.findById(donationId).lean();
    } catch (err) {
      console.error(`[aiDecisionService] Error finding donation ${donationId}:`, err.message);
    }
  }

  const modelRegistry = aiGovernanceService.getCentralModelStatus();
  const capabilities = aiGovernanceService.getAiCapabilities();

  // Safe concurrent capability execution with Error Isolation
  const [demandRes, riskRes, recRes, priorityRes, routeRes] = await Promise.allSettled([
    // 1. Demand Prediction
    (async () => {
      if (!donation) return { insufficientData: true, message: 'Donation data required for demand prediction.' };
      try {
        return await aiService.predictDemand({
          food_category: donation.category,
          center_type: 'TYPE_A',
          op_area: 5.0,
          previous_donations: 150
        });
      } catch (err) {
        return { insufficientData: true, modelReady: false, message: 'Demand prediction service unavailable.' };
      }
    })(),

    // 2. Risk Assessment (Milk scope only)
    (async () => {
      if (!donation) return { insufficientData: true, message: 'Donation required for risk assessment.' };
      try {
        return await aiService.riskScore({
          food_category: donation.category,
          ph: donation.ph,
          temperature: donation.temperature,
          taste: donation.taste,
          odor: donation.odor,
          fat: donation.fat,
          turbidity: donation.turbidity,
          color: donation.color
        });
      } catch (err) {
        return { insufficientData: true, modelReady: false, message: 'Risk assessment service unavailable.' };
      }
    })(),

    // 3. NGO Recommendation
    (async () => {
      try {
        const payload = donation
          ? { latitude: donation.latitude, longitude: donation.longitude, foodCategory: donation.category }
          : options;
        return await aiService.recommend(payload);
      } catch (err) {
        return { insufficientData: true, message: 'NGO recommendation service unavailable.' };
      }
    })(),

    // 4. Priority Readiness & Score
    (async () => {
      try {
        const readiness = await aiDataReadinessService.getPriorityDataReadiness();
        return {
          prediction: null,
          priorityScore: null,
          priorityLevel: null,
          insufficientData: true,
          modelReady: false,
          modelStatus: readiness.status || 'INSUFFICIENT_DATA',
          modelVersion: '1.0.0',
          foodBridgeTrained: false,
          recordsAvailable: readiness.recordsAvailable ?? 0,
          minimumRequired: readiness.minimumRequired ?? 500,
          weeksAvailable: readiness.weeksAvailable ?? 0,
          minimumWeeksRequired: readiness.minimumWeeksRequired ?? 12,
          message: 'FoodBridge Priority Model is currently collecting operational transaction data.'
        };
      } catch (err) {
        return { insufficientData: true, modelStatus: 'INSUFFICIENT_DATA', message: 'Priority model readiness check unavailable.' };
      }
    })(),

    // 5. Route Optimization
    (async () => {
      if (!donation || !options.ngoLatitude || !options.ngoLongitude) {
        return { insufficientData: true, message: 'Real coordinates required for route optimization.' };
      }
      try {
        return await aiService.optimizeRoute({
          origin_lat: donation.latitude,
          origin_lng: donation.longitude,
          dest_lat: options.ngoLatitude,
          dest_lng: options.ngoLongitude
        });
      } catch (err) {
        return { insufficientData: true, message: 'Route optimization service unavailable.' };
      }
    })()
  ]);

  return {
    donation: donation || null,
    capabilities,
    modelRegistry: modelRegistry.models || [],
    demand: demandRes.status === 'fulfilled' ? demandRes.value : { insufficientData: true, message: 'Demand evaluation error' },
    risk: riskRes.status === 'fulfilled' ? riskRes.value : { insufficientData: true, message: 'Risk evaluation error' },
    recommendations: recRes.status === 'fulfilled' ? recRes.value : { insufficientData: true, message: 'Recommendation evaluation error' },
    priority: priorityRes.status === 'fulfilled' ? priorityRes.value : { insufficientData: true, message: 'Priority evaluation error' },
    route: routeRes.status === 'fulfilled' ? routeRes.value : { insufficientData: true, message: 'Route evaluation error' }
  };
};

module.exports = {
  getAiDecisionForDonation
};
