const { body, query } = require('express-validator');

const allowedUserRoles = ['user', 'admin', 'partner', 'ngo'];
const allowedUserStatuses = ['ACTIVE', 'SUSPENDED', 'BLOCKED'];
const allowedDonationStatuses = ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKED_UP', 'COMPLETED', 'REJECTED', 'EXPIRED'];
const allowedRequestStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'];
const allowedRange = ['daily', 'weekly', 'monthly', 'yearly'];

const listUsersValidator = [
  query('search').optional().trim(),
  query('role').optional().isIn(allowedUserRoles).withMessage('Invalid user role'),
  query('status').optional().isIn(allowedUserStatuses).withMessage('Invalid user status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
];

const userUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Valid phone number is required'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('pincode').optional().trim().notEmpty().withMessage('Pincode cannot be empty'),
  body('role').optional().isIn(allowedUserRoles).withMessage('Invalid role'),
  body('status').optional().isIn(allowedUserStatuses).withMessage('Invalid status')
];

const userStatusValidator = [
  body('status').notEmpty().isIn(allowedUserStatuses).withMessage('Status must be ACTIVE, SUSPENDED, or BLOCKED'),
  body('reason').optional().trim()
];

const actionReasonValidator = [
  body('reason').optional().trim()
];

const donationStatusValidator = [
  body('status').notEmpty().isIn(allowedDonationStatuses).withMessage('Invalid donation status')
];

const requestStatusValidator = [
  body('status').notEmpty().isIn(allowedRequestStatuses).withMessage('Invalid request status')
];

const reportRangeValidator = [
  query('range').optional().isIn(allowedRange).withMessage('Range must be daily, weekly, monthly, or yearly')
];

const notificationValidator = [
  body('recipientType')
    .notEmpty()
    .isIn(['ALL', 'DONOR', 'NGO', 'USER'])
    .withMessage('recipientType must be ALL, DONOR, NGO, or USER'),
  body('recipientId').optional().isMongoId().withMessage('recipientId must be a valid Mongo ID'),
  body('type')
    .notEmpty()
    .isIn([
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
    ])
    .withMessage('Invalid notification type'),
  body('title').notEmpty().trim().withMessage('Notification title is required'),
  body('message').notEmpty().trim().withMessage('Notification message is required')
];

module.exports = {
  listUsersValidator,
  userUpdateValidator,
  userStatusValidator,
  actionReasonValidator,
  donationStatusValidator,
  requestStatusValidator,
  reportRangeValidator,
  notificationValidator
};
