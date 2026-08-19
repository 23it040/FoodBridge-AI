const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');

const getNotifications = async (req, res) => {
  const data = await notificationService.listNotifications(req.user, req.query);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Notifications fetched successfully', data }));
};

const getUnreadNotifications = async (req, res) => {
  const query = { ...req.query, unread: true };
  const data = await notificationService.listNotifications(req.user, query);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Unread notifications fetched successfully', data }));
};

const markNotificationRead = async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Notification marked as read', data: notification }));
};

const markAllNotificationsRead = async (req, res) => {
  await notificationService.markAllRead(req.user);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'All notifications marked as read' }));
};

const deleteNotification = async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user);
  res.status(200).json(new ApiResponse({ success: true, statusCode: 200, message: 'Notification deleted successfully' }));
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
};
