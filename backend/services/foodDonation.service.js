const FoodDonation = require('../models/FoodDonation.model');
const ApiError = require('../utils/ApiError');

const createDonation = async (donationData) => {
  const donation = await FoodDonation.create(donationData);
  return donation;
};

const listDonations = async (user, query = {}) => {
  const now = new Date();
  let filter;

  if (user && user.role === 'admin') {
    filter = {};
  } else if (user) {
    filter = {
      $or: [
        { status: 'AVAILABLE', expiryTime: { $gt: now } },
        { donorId: user._id }
      ]
    };
  } else {
    filter = { status: 'AVAILABLE', expiryTime: { $gt: now } };
  }

  if (query.status && (!user || user.role !== 'admin')) {
    filter.status = query.status;
  }

  let dbQuery = FoodDonation.find(filter).populate('donorId', 'name email role').sort({ createdAt: -1 });

  if (query.limit && Number(query.limit) > 0) {
    dbQuery = dbQuery.limit(Number(query.limit));
  }

  return dbQuery;
};

const mongoose = require('mongoose');

const getDonationById = async (id, user) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid food donation ID');
  }

  const donation = await FoodDonation.findById(id).populate('donorId', 'name email role');
  if (!donation) {
    throw new ApiError(404, 'Food donation not found');
  }

  const userRole = (user && user.role) ? String(user.role).toLowerCase() : '';
  const isDonor = user && donation.donorId && (donation.donorId._id || donation.donorId).toString() === user._id.toString();
  const isAdmin = userRole === 'admin';
  const isNGO = userRole === 'ngo' || userRole === 'partner';
  const isAvailable = String(donation.status || '').toUpperCase() === 'AVAILABLE';

  if (!isAvailable && !isDonor && !isAdmin && !isNGO) {
    throw new ApiError(403, 'Access denied to this donation');
  }

  return donation;
};


const updateDonation = async (id, user, updateData) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) {
    throw new ApiError(404, 'Food donation not found');
  }

  if (donation.donorId.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Only the donor can modify this donation');
  }

  Object.assign(donation, updateData);
  await donation.save();
  return donation;
};

const deleteDonation = async (id, user) => {
  const donation = await FoodDonation.findById(id);
  if (!donation) {
    throw new ApiError(404, 'Food donation not found');
  }

  if (donation.donorId.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Only the donor can delete this donation');
  }

  await donation.deleteOne();
  return donation;
};

const getDonationImpactMetrics = async () => {
  try {
    const [overallMetrics, categoryMetrics, statusMetrics] = await Promise.all([
      FoodDonation.aggregate([
        {
          $facet: {
            allTime: [
              {
                $group: {
                  _id: null,
                  totalDonations: { $sum: 1 },
                  totalQuantityListed: { $sum: '$quantity' }
                }
              }
            ],
            completed: [
              {
                $match: {
                  status: { $in: ['ACCEPTED', 'PICKED_UP', 'COMPLETED'] }
                }
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  mealsDelivered: { $sum: '$quantity' }
                }
              }
            ],
            active: [
              {
                $match: {
                  status: { $in: ['AVAILABLE', 'REQUESTED'] },
                  expiryTime: { $gt: new Date() }
                }
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  activeMeals: { $sum: '$quantity' }
                }
              }
            ]
          }
        }
      ]),
      FoodDonation.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      FoodDonation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const allTimeStats = overallMetrics[0]?.allTime[0] || { totalDonations: 0, totalQuantityListed: 0 };
    const completedStats = overallMetrics[0]?.completed[0] || { count: 0, mealsDelivered: 0 };
    const activeStats = overallMetrics[0]?.active[0] || { count: 0, activeMeals: 0 };

    const meals = completedStats.mealsDelivered || (allTimeStats.totalQuantityListed > 0 ? Math.round(allTimeStats.totalQuantityListed * 0.75) : 0);
    const co2Kg = Math.round(meals * 1.85);
    const waterLiters = Math.round(meals * 142);
    const wasteDivertedKg = Math.round(meals * 0.45);
    const treesEquivalent = Number((co2Kg / 22).toFixed(1));

    const categoryBreakdown = (categoryMetrics || []).map((cat) => ({
      category: cat._id || 'General',
      count: cat.count,
      totalQuantity: cat.totalQuantity,
      percentage: allTimeStats.totalDonations > 0
        ? Math.round((cat.count / allTimeStats.totalDonations) * 100)
        : 0
    }));

    const statusBreakdown = (statusMetrics || []).reduce((acc, curr) => {
      if (curr._id) acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      totals: {
        totalDonationsListed: allTimeStats.totalDonations,
        completedRedistributions: completedStats.count,
        activeAvailableDonations: activeStats.count,
        totalMealsDelivered: meals
      },
      environmentalImpact: {
        co2PreventedKg: co2Kg,
        waterPreservedLiters: waterLiters,
        wasteDivertedKg,
        treesEquivalent
      },
      categoryBreakdown,
      statusBreakdown,
      calculatedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('[foodDonationService.getDonationImpactMetrics] Error:', err.message);
    return {
      totals: {
        totalDonationsListed: 0,
        completedRedistributions: 0,
        activeAvailableDonations: 0,
        totalMealsDelivered: 0
      },
      environmentalImpact: {
        co2PreventedKg: 0,
        waterPreservedLiters: 0,
        wasteDivertedKg: 0,
        treesEquivalent: 0
      },
      categoryBreakdown: [],
      statusBreakdown: {},
      calculatedAt: new Date().toISOString()
    };
  }
};

module.exports = {
  createDonation,
  listDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getDonationImpactMetrics
};
