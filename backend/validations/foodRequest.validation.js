const { body } = require('express-validator');

const requestStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'COMPLETED'];

const createFoodRequestValidator = [
  body('foodId').notEmpty().withMessage('Food donation ID is required').isMongoId().withMessage('Food donation ID must be a valid Mongo ID'),
  body('requestMessage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Request message must be 500 characters or less'),
  body('pickupDate')
    .optional()
    .isISO8601()
    .withMessage('Pickup date must be a valid ISO8601 date'),
  body('pickupTime')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Pickup time cannot be empty')
];

const updateFoodRequestStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(requestStatuses)
    .withMessage(`Status must be one of: ${requestStatuses.join(', ')}`),
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason must be 500 characters or less'),
  body('completedAt')
    .optional()
    .isISO8601()
    .withMessage('Completed at must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (req.body.status === 'COMPLETED' && !value) {
        throw new Error('Completed at is required when status is COMPLETED');
      }
      return true;
    })
];

module.exports = {
  createFoodRequestValidator,
  updateFoodRequestStatusValidator
};
