const mongoose = require('mongoose');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

const notificationTypes = [
  'FOOD_REQUEST_CREATED',
  'FOOD_REQUEST_ACCEPTED',
  'FOOD_REQUEST_REJECTED',
  'FOOD_PICKUP_REMINDER',
  'FOOD_PICKED_UP',
  'FOOD_COMPLETED',
  'NGO_VERIFIED',
  'NGO_REJECTED',
  'NEW_DONATION',
  'SYSTEM_NOTIFICATION'
];

const createNotification = async ({ recipientType, recipientId, senderId, title, message, type, data = {} }) => {
  if (!recipientType) {
    throw new ApiError(400, 'recipientType is required');
  }

  if (!title) {
    throw new ApiError(400, 'title is required');
  }

  if (!message) {
    throw new ApiError(400, 'message is required');
  }

  if (!type || !notificationTypes.includes(type)) {
    throw new ApiError(400, 'Invalid notification type');
  }

  if (recipientType === 'USER' && !recipientId) {
    throw new ApiError(400, 'recipientId is required for USER notifications');
  }

  const payload = {
    recipientType,
    title,
    message,
    type,
    data,
    createdBy: senderId
  };

  if (recipientId) {
    payload.recipient = recipientId;
  }

  if (senderId) {
    payload.sender = senderId;
  }

  return Notification.create(payload);
};

const buildRecipientQuery = (user) => {
  const filter = { $or: [{ recipientType: 'ALL' }] };

  if (user.role === 'admin') {
    filter.$or.push({ recipientType: 'ADMIN' });
  }
  if (user.role === 'partner' || user.role === 'user') {
    filter.$or.push({ recipientType: 'DONOR' });
  }
  if (user.role === 'ngo') {
    filter.$or.push({ recipientType: 'NGO' });
  }
  filter.$or.push({ recipientType: 'USER', recipient: user._id });

  return filter;
};

const listNotifications = async (user, query = {}) => {
  const { page = 1, limit = 20, sort = 'desc', unread } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = buildRecipientQuery(user);
  if (unread === 'true' || unread === true) {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter)
    .populate('sender', 'name email role')
    .populate('recipient', 'name email role')
    .populate('createdBy', 'name email role')
    .sort({ createdAt: sort === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

  return {
    notifications,
    total,
    unreadCount,
    page: Number(page),
    limit: Number(limit)
  };
};

const getNotificationById = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid notification ID');
  }

  const filter = { _id: id, ...buildRecipientQuery(user) };
  const notification = await Notification.findOne(filter)
    .populate('sender', 'name email role')
    .populate('recipient', 'name email role')
    .populate('createdBy', 'name email role');

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return notification;
};

const markAsRead = async (id, user) => {
  const notification = await getNotificationById(id, user);
  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }
  return notification;
};

const markAllRead = async (user) => {
  const filter = buildRecipientQuery(user);
  await Notification.updateMany(filter, { isRead: true });
  return { success: true };
};

const deleteNotification = async (id, user) => {
  const notification = await getNotificationById(id, user);
  await notification.deleteOne();
  return notification;
};

const sendNearbyDonationNotification = async (donation, radiusKm = 50) => {
  const ngos = await User.find({ role: 'ngo' });

  const deg2rad = (deg) => (deg * Math.PI) / 180;
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const nearbyNgos = ngos.filter((ngo) => {
    if (!ngo.latitude || !ngo.longitude) return true;
    return getDistance(donation.latitude, donation.longitude, ngo.latitude, ngo.longitude) <= radiusKm;
  });

  const targets = nearbyNgos.length > 0 ? nearbyNgos : ngos;

  const notifications = targets.map((ngo) => ({
    recipientType: 'USER',
    recipient: ngo._id,
    sender: donation.donorId,
    title: 'New Food Donation Available',
    message: `A new food donation "${donation.foodName}" is available for pickup.`,
    type: 'NEW_DONATION',
    data: { donationId: donation._id },
    createdBy: donation.donorId
  }));

  if (notifications.length > 0) {
    return Notification.insertMany(notifications);
  }
  return [];
};

module.exports = {
  notificationTypes,
  createNotification,
  listNotifications,
  getNotificationById,
  markAsRead,
  markAllRead,
  deleteNotification,
  sendNearbyDonationNotification
};
