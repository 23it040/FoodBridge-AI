const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(notificationController.getNotifications));
router.get('/unread', asyncHandler(notificationController.getUnreadNotifications));
router.patch('/:id/read', asyncHandler(notificationController.markNotificationRead));
router.patch('/read-all', asyncHandler(notificationController.markAllNotificationsRead));
router.delete('/:id', asyncHandler(notificationController.deleteNotification));

module.exports = router;
