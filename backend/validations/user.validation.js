const { body } = require('express-validator');

const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must be 20 characters or less'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage('Address must be 250 characters or less')
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];

module.exports = {
  updateProfileValidator,
  changePasswordValidator
};
