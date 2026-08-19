import { FoodDonation } from '../models/index.js';

class DonationRepository {
  create(data) {
    return FoodDonation.create(data);
  }

  findById(id, populate = []) {
    let query = FoodDonation.findById(id);
    populate.forEach((p) => {
      query = query.populate(p);
    });
    return query;
  }

  findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 10, sort = '-createdAt', populate = [] } = options;
    let query = FoodDonation.find(filter).sort(sort).skip(skip).limit(limit);
    populate.forEach((p) => {
      query = query.populate(p);
    });
    return query;
  }

  findNearby(filter, coordinates, maxDistanceMeters, options = {}) {
    const { skip = 0, limit = 10, sort = '-createdAt', populate = [] } = options;
    let query = FoodDonation.find({
      ...filter,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: maxDistanceMeters,
        },
      },
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    populate.forEach((p) => {
      query = query.populate(p);
    });
    return query;
  }

  updateById(id, data) {
    return FoodDonation.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  count(filter = {}) {
    return FoodDonation.countDocuments(filter);
  }

  countNearby(filter, coordinates, maxDistanceMeters) {
    return FoodDonation.countDocuments({
      ...filter,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: maxDistanceMeters,
        },
      },
    });
  }
}

export default new DonationRepository();
