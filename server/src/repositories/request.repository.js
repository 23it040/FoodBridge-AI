import { FoodRequest } from '../models/index.js';

class RequestRepository {
  create(data) {
    return FoodRequest.create(data);
  }

  findById(id, populate = []) {
    let query = FoodRequest.findById(id);
    populate.forEach((p) => {
      query = query.populate(p);
    });
    return query;
  }

  findByIdWithOtp(id) {
    return FoodRequest.findById(id).select('+handoverOtp +handoverOtpExpiresAt');
  }

  findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = '-createdAt', populate = [] } = options;
    let query = FoodRequest.find(filter).sort(sort).skip(skip).limit(limit);
    populate.forEach((p) => {
      query = query.populate(p);
    });
    return query;
  }

  updateById(id, data) {
    return FoodRequest.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  count(filter = {}) {
    return FoodRequest.countDocuments(filter);
  }

  findActivePickupRequest(donationId, ngoId) {
    return FoodRequest.findOne({
      donationId,
      ngoId,
      requestType: 'pickup',
      status: { $in: ['pending', 'accepted'] },
    });
  }
}

export default new RequestRepository();
