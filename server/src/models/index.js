import User from './User.model.js';
import FoodDonation from './FoodDonation.model.js';
import FoodRequest from './FoodRequest.model.js';
import Notification from './Notification.model.js';
import Review from './Review.model.js';
import AIRecommendation from './AIRecommendation.model.js';
import Analytics from './Analytics.model.js';

export {
  User,
  FoodDonation,
  FoodRequest,
  Notification,
  Review,
  AIRecommendation,
  Analytics,
};

export const models = {
  User,
  FoodDonation,
  FoodRequest,
  Notification,
  Review,
  AIRecommendation,
  Analytics,
};

export const modelRelationships = {
  User: {
    hasMany: ['FoodDonation', 'FoodRequest', 'Notification', 'Review', 'Analytics'],
    referencedBy: [
      { model: 'FoodDonation', fields: ['donorId', 'assignedNgoId'] },
      { model: 'FoodRequest', fields: ['ngoId', 'respondedBy'] },
      { model: 'Notification', fields: ['userId'] },
      { model: 'Review', fields: ['reviewerId', 'revieweeId'] },
      { model: 'AIRecommendation', fields: ['requestedBy', 'selectedNgoId', 'rankedNgos.ngoId'] },
      { model: 'Analytics', fields: ['userId'] },
    ],
  },
  FoodDonation: {
    belongsTo: [{ model: 'User', fields: ['donorId', 'assignedNgoId'] }],
    hasMany: ['FoodRequest', 'Review', 'AIRecommendation'],
    referencedBy: [
      { model: 'FoodRequest', fields: ['donationId'] },
      { model: 'Notification', fields: ['metadata.donationId'] },
      { model: 'Review', fields: ['donationId'] },
      { model: 'AIRecommendation', fields: ['donationId'] },
    ],
  },
  FoodRequest: {
    belongsTo: [
      { model: 'User', fields: ['ngoId', 'respondedBy'] },
      { model: 'FoodDonation', fields: ['donationId'] },
    ],
    hasOne: ['Review'],
    referencedBy: [
      { model: 'Notification', fields: ['metadata.foodRequestId'] },
      { model: 'Review', fields: ['foodRequestId'] },
    ],
  },
  Notification: {
    belongsTo: [{ model: 'User', fields: ['userId'] }],
  },
  Review: {
    belongsTo: [
      { model: 'FoodDonation', fields: ['donationId'] },
      { model: 'FoodRequest', fields: ['foodRequestId'] },
      { model: 'User', fields: ['reviewerId', 'revieweeId'] },
    ],
  },
  AIRecommendation: {
    belongsTo: [
      { model: 'FoodDonation', fields: ['donationId'] },
      { model: 'User', fields: ['requestedBy', 'selectedNgoId'] },
    ],
  },
  Analytics: {
    belongsTo: [{ model: 'User', fields: ['userId'] }],
  },
};

export default models;
