const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  listUsersValidator,
  userUpdateValidator,
  userStatusValidator,
  actionReasonValidator,
  donationStatusValidator,
  requestStatusValidator,
  reportRangeValidator,
  notificationValidator
} = require('../validations/admin.validation');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/dashboard', asyncHandler(adminController.getDashboard));

router.get('/users', listUsersValidator, validateRequest, asyncHandler(adminController.listUsers));
router.get('/users/:id', asyncHandler(adminController.getUser));
router.put('/users/:id', userUpdateValidator, validateRequest, asyncHandler(adminController.updateUser));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));
router.patch('/users/:id/status', userStatusValidator, validateRequest, asyncHandler(adminController.updateUserStatus));

router.get('/ngos/pending', asyncHandler(adminController.listPendingNgos));
router.patch('/ngos/:id/approve', actionReasonValidator, validateRequest, asyncHandler(adminController.approveNgo));
router.patch('/ngos/:id/reject', actionReasonValidator, validateRequest, asyncHandler(adminController.rejectNgo));
router.patch('/ngos/:id/suspend', actionReasonValidator, validateRequest, asyncHandler(adminController.suspendNgo));

router.get('/donations', asyncHandler(adminController.listDonations));
router.get('/donations/:id', asyncHandler(adminController.getDonation));
router.patch('/donations/:id/status', donationStatusValidator, validateRequest, asyncHandler(adminController.updateDonationStatus));
router.delete('/donations/:id', asyncHandler(adminController.deleteDonation));

router.get('/requests', asyncHandler(adminController.listRequests));
router.get('/requests/:id', asyncHandler(adminController.getRequest));
router.patch('/requests/:id/status', requestStatusValidator, validateRequest, asyncHandler(adminController.updateRequestStatus));
router.delete('/requests/:id', asyncHandler(adminController.deleteRequest));

router.get('/reports/overview', reportRangeValidator, validateRequest, asyncHandler(adminController.reportsOverview));
router.get('/reports/donations', reportRangeValidator, validateRequest, asyncHandler(adminController.reportsDonations));
router.get('/reports/requests', reportRangeValidator, validateRequest, asyncHandler(adminController.reportsRequests));
router.get('/reports/users', reportRangeValidator, validateRequest, asyncHandler(adminController.reportsUsers));

router.get('/analytics', asyncHandler(adminController.getAnalytics));
router.get('/audit-logs', asyncHandler(adminController.listAuditLogs));

router.post('/notifications', notificationValidator, validateRequest, asyncHandler(adminController.createNotification));
router.get('/notifications', asyncHandler(adminController.listNotifications));

module.exports = router;
