import { AIRecommendation } from '../models/index.js';

class AIRecommendationRepository {
  create(data) {
    return AIRecommendation.create(data);
  }

  findById(id, populate = []) {
    let query = AIRecommendation.findById(id);
    populate.forEach((p) => {
      query = query.populate(p);
    });
    return query;
  }

  findByDonationId(donationId, options = {}) {
    const { limit = 5, populate = [] } = options;
    let query = AIRecommendation.find({ donationId }).sort({ createdAt: -1 }).limit(limit);
    populate.forEach((p) => {
      query = query.populate(p);
    });
    return query;
  }

  findLatestByDonationId(donationId, populate = []) {
    let query = AIRecommendation.findOne({ donationId }).sort({ createdAt: -1 });
    populate.forEach((p) => {
      query = query.populate(p);
    });
    return query;
  }
}

export default new AIRecommendationRepository();
