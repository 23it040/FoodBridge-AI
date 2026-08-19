const { body } = require('express-validator');

const profileImageValidator = body('profileImage').optional();

const registerNgoValidator = [
  body('organizationName').trim().notEmpty().withMessage('Organization name is required'),
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required'),
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be valid'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be valid')
];

const verifyNgoValidator = [
  body('verificationStatus')
    .notEmpty()
    .withMessage('Verification status is required')
    .isIn(['APPROVED', 'REJECTED', 'SUSPENDED'])
    .withMessage('Verification status must be APPROVED, REJECTED, or SUSPENDED')
];

const updateNgoProfileValidator = [
  body('organizationName').optional().trim().notEmpty().withMessage('Organization name cannot be empty'),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone cannot be empty')
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('pincode').optional().trim().notEmpty().withMessage('Pincode cannot be empty'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be valid'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be valid')
];

module.exports = {
  registerNgoValidator,
  verifyNgoValidator,
  updateNgoProfileValidator
};
