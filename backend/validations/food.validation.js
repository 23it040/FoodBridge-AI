const { body } = require('express-validator');

const statusOptions = ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKED_UP', 'COMPLETED', 'REJECTED', 'EXPIRED'];

const createFoodDonationValidator = [
  body('foodName').trim().notEmpty().withMessage('Food name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 1 })
    .withMessage('Quantity must be a number greater than 0'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  body('cookedTime')
    .notEmpty()
    .withMessage('Cooked time is required')
    .isISO8601()
    .withMessage('Cooked time must be a valid ISO8601 date'),
  body('expiryTime')
    .notEmpty()
    .withMessage('Expiry time is required')
    .isISO8601()
    .withMessage('Expiry time must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (req.body.cookedTime && new Date(value) <= new Date(req.body.cookedTime)) {
        throw new Error('Expiry time must be after cooked time');
      }
      return true;
    }),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('status')
    .optional()
    .isIn(statusOptions)
    .withMessage(`Status must be one of: ${statusOptions.join(', ')}`)
];

const updateFoodDonationValidator = [
  body('foodName').optional().trim().notEmpty().withMessage('Food name cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('quantity')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Quantity must be a number greater than 0'),
  body('unit').optional().trim().notEmpty().withMessage('Unit cannot be empty'),
  body('cookedTime')
    .optional()
    .isISO8601()
    .withMessage('Cooked time must be a valid ISO8601 date'),
  body('expiryTime')
    .optional()
    .isISO8601()
    .withMessage('Expiry time must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (req.body.cookedTime && new Date(value) <= new Date(req.body.cookedTime)) {
        throw new Error('Expiry time must be after cooked time');
      }
      return true;
    }),
  body('pickupAddress').optional().trim().notEmpty().withMessage('Pickup address cannot be empty'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('status')
    .optional()
    .isIn(statusOptions)
    .withMessage(`Status must be one of: ${statusOptions.join(', ')}`)
];

module.exports = {
  createFoodDonationValidator,
  updateFoodDonationValidator
};
