import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { haversineDistanceKm } from '../utils/helpers.js';
import donationRepository from '../repositories/donation.repository.js';
import userRepository from '../repositories/user.repository.js';
import aiRecommendationRepository from '../repositories/aiRecommendation.repository.js';
import notificationService from './notification.service.js';
import { USER_ROLES, NOTIFICATION_TYPES } from '../constants/enums.js';

class AIService {
  async getRecommendations(donationId, requestedBy) {
    const startTime = Date.now();
    const donation = await donationRepository.findById(donationId);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    let rankedNgos;
    let fallbackUsed = false;
    let fallbackReason = null;
    let modelVersion = 'rule-based-v1';
    let modelType = 'rule_based';

    try {
      if (env.aiService.url && env.aiService.token) {
        const aiResult = await this.callExternalAIService(donation);
        rankedNgos = aiResult.rankedNgos;
        modelVersion = aiResult.modelVersion || modelVersion;
        modelType = aiResult.modelType || 'ml';
      } else {
        throw new Error('AI service not configured');
      }
    } catch (error) {
      logger.warn(`AI service fallback: ${error.message}`);
      fallbackUsed = true;
      fallbackReason = error.message;
      rankedNgos = await this.generateRuleBasedRecommendations(donation);
    }

    const recommendation = await aiRecommendationRepository.create({
      donationId,
      requestedBy,
      modelVersion,
      modelType,
      inputFeatures: {
        donationQuantity: donation.quantity,
        donationCategory: donation.category,
        expiryHoursRemaining: Math.max(
          0,
          (new Date(donation.expiryTime) - Date.now()) / (1000 * 60 * 60)
        ),
        candidateNgoCount: rankedNgos.length,
        averageDistanceKm: this.calculateAverageDistance(donation, rankedNgos),
      },
      rankedNgos,
      processingTimeMs: Date.now() - startTime,
      fallbackUsed,
      fallbackReason,
    });

    await donationRepository.updateById(donationId, {
      aiRecommendedNgos: rankedNgos.slice(0, 10).map(({ ngoId, score, rank }) => ({
        ngoId,
        score,
        rank,
      })),
      latestRecommendationId: recommendation._id,
    });

    if (rankedNgos[0]) {
      await notificationService.create({
        userId: rankedNgos[0].ngoId,
        type: NOTIFICATION_TYPES.DONATION,
        title: 'Recommended Donation Match',
        message: `You are a top match for donation "${donation.title}".`,
        metadata: { donationId: donation._id },
        priority: 'high',
      });
    }

    return aiRecommendationRepository.findById(recommendation._id, [
      { path: 'donationId', select: 'title category quantity expiryTime' },
      { path: 'rankedNgos.ngoId', select: 'profile.organizationName profile.location profile.phone' },
    ]);
  }

  async callExternalAIService(donation) {
    const response = await fetch(`${env.aiService.url}/api/v1/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.aiService.token}`,
      },
      body: JSON.stringify({
        donationId: donation._id,
        category: donation.category,
        quantity: donation.quantity,
        expiryTime: donation.expiryTime,
        location: donation.location,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status ${response.status}`);
    }

    return response.json();
  }

  async generateRuleBasedRecommendations(donation) {
    const coordinates = donation.location.coordinates;
    const nearbyNgos = await userRepository.findNearbyNgos(coordinates, 50000);

    const expiryHoursRemaining = Math.max(
      0,
      (new Date(donation.expiryTime) - Date.now()) / (1000 * 60 * 60)
    );
    const expiryUrgency = Math.min(1, 1 / Math.max(expiryHoursRemaining, 0.5));

    const scored = nearbyNgos.map((ngo) => {
      const ngoCoords = ngo.profile?.location?.coordinates || coordinates;
      const distanceKm = haversineDistanceKm(coordinates, ngoCoords);
      const distanceScore = Math.max(0, 1 - distanceKm / 50);

      const capacity = ngo.profile?.capacityPerDay || 100;
      const quantityMatch = Math.min(1, donation.quantity / capacity);

      const preferredTypes = ngo.profile?.preferredFoodTypes || [];
      const demandAlignment =
        preferredTypes.length === 0 || preferredTypes.includes(donation.foodType) ? 1 : 0.5;

      const historyScore = (ngo.profile?.stats?.successRate || 50) / 100;

      const score =
        (distanceScore * 0.35 +
          quantityMatch * 0.2 +
          expiryUrgency * 0.2 +
          demandAlignment * 0.15 +
          historyScore * 0.1) *
        100;

      return {
        ngoId: ngo._id,
        score: Math.round(score * 100) / 100,
        explanation: {
          distanceKm: Math.round(distanceKm * 100) / 100,
          distanceScore: Math.round(distanceScore * 100) / 100,
          quantityMatch: Math.round(quantityMatch * 100) / 100,
          expiryUrgency: Math.round(expiryUrgency * 100) / 100,
          demandAlignment: Math.round(demandAlignment * 100) / 100,
          historyScore: Math.round(historyScore * 100) / 100,
        },
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 10).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  calculateAverageDistance(donation, rankedNgos) {
    if (!rankedNgos.length) return 0;

    const coords = donation.location.coordinates;
    const total = rankedNgos.reduce((sum, item) => {
      const ngoCoords = item.explanation?.distanceKm ?? 0;
      return sum + ngoCoords;
    }, 0);

    return Math.round((total / rankedNgos.length) * 100) / 100;
  }

  async getRecommendationHistory(donationId) {
    const donation = await donationRepository.findById(donationId);

    if (!donation) {
      throw ApiError.notFound('Donation not found');
    }

    return aiRecommendationRepository.findByDonationId(donationId, {
      populate: [
        { path: 'rankedNgos.ngoId', select: 'profile.organizationName' },
        { path: 'requestedBy', select: 'email profile.organizationName' },
      ],
    });
  }
}

export default new AIService();
