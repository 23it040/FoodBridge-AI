const User = require('../models/User.model');
const FoodDonation = require('../models/FoodDonation.model');
const FoodRequest = require('../models/FoodRequest.model');
const ApiError = require('../utils/ApiError');

const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const updateUser = async (id, updateData) => {
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
    context: 'query'
  }).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const changePassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return user;
};

const deleteUserAccount = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const getDonorDashboard = async (user) => {
  const donorId = user._id;

  const [
    totalDonations,
    availableItems,
    acceptedRequests,
    completedDeliveries,
    pendingRequests,
    mealsDonatedAggregation,
    recentDonations,
    recentRequests,
    donationsByMonthRaw,
    statusBreakdownRaw
  ] = await Promise.all([
    FoodDonation.countDocuments({ donorId }),
    FoodDonation.countDocuments({ donorId, status: 'AVAILABLE' }),
    FoodRequest.countDocuments({ donorId, status: 'ACCEPTED' }),
    FoodRequest.countDocuments({ donorId, status: 'COMPLETED' }),
    FoodRequest.countDocuments({ donorId, status: 'PENDING' }),
    FoodDonation.aggregate([
      { $match: { donorId } },
      { $group: { _id: null, totalMeals: { $sum: '$quantity' } } }
    ]),
    FoodDonation.find({ donorId }).sort({ createdAt: -1 }).limit(5),
    FoodRequest.find({ donorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('foodId')
      .populate('ngoId', 'name email organizationName'),
    FoodDonation.aggregate([
      { $match: { donorId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id': 1 } }
    ]),
    FoodDonation.aggregate([
      { $match: { donorId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const donationsByMonth = donationsByMonthRaw.map((item) => ({
    month: item._id,
    count: item.count,
    totalQuantity: item.totalQuantity
  }));

  const statusBreakdown = statusBreakdownRaw.map((item) => ({
    name: String(item._id || 'AVAILABLE').toUpperCase(),
    value: item.count
  }));

  const stats = {
    totalDonations,
    availableItems,
    availableDonations: availableItems,
    acceptedRequests,
    completedDeliveries,
    completedDonations: completedDeliveries,
    pendingRequests,
    totalMealsDonated: mealsDonatedAggregation[0]?.totalMeals || 0
  };

  return {
    stats,
    totalDonations,
    availableItems,
    availableDonations: availableItems,
    acceptedRequests,
    completedDeliveries,
    completedDonations: completedDeliveries,
    pendingRequests,
    totalMealsDonated: mealsDonatedAggregation[0]?.totalMeals || 0,
    recentDonations,
    recentRequests,
    donationsByMonth,
    statusBreakdown
  };
};

module.exports = {
  getUserById,
  updateUser,
  changePassword,
  deleteUserAccount,
  getDonorDashboard
};
