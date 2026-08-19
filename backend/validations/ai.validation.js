const { body } = require('express-validator');

const recommendValidator = [
  body('donation').optional(),
  body('donationId').optional(),
  body('ngos').optional().isArray().withMessage('ngos must be an array'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180')
];

const riskValidator = [
  body('foodCategory').optional().notEmpty().withMessage('foodCategory cannot be empty'),
  body('food_category').optional().notEmpty().withMessage('food_category cannot be empty'),
  body('pH').optional().isFloat({ min: 0, max: 14 }).withMessage('pH must be a number between 0 and 14'),
  body('ph').optional().isFloat({ min: 0, max: 14 }).withMessage('pH must be a number between 0 and 14'),
  body('temperature').optional().isFloat().withMessage('Temperature must be a valid number'),
  body('temperature_c').optional().isFloat().withMessage('Temperature must be a valid number')
];

const priorityValidator = [
  body('expiryTime').optional().notEmpty().withMessage('expiryTime cannot be empty'),
  body('expiry_time').optional().notEmpty().withMessage('expiry_time cannot be empty'),
  body('quantity').optional().notEmpty().withMessage('quantity cannot be empty'),
  body('distanceKm').optional().notEmpty().withMessage('distanceKm cannot be empty'),
  body('distance_km').optional().notEmpty().withMessage('distance_km cannot be empty'),
  body('demand').optional().notEmpty().withMessage('demand cannot be empty'),
  body('ngoCapacity').optional().notEmpty().withMessage('ngoCapacity cannot be empty'),
  body('ngo_capacity').optional().notEmpty().withMessage('ngo_capacity cannot be empty')
];

const demandValidator = [
  body().custom((b) => {
    if (!b || (!b.city && !b.location)) {
      throw new Error('Either city or location is required');
    }
    return true;
  }),
  body('dayOfWeek').optional().notEmpty().withMessage('dayOfWeek cannot be empty'),
  body('day_of_week').optional().notEmpty().withMessage('day_of_week cannot be empty')
];

const optimizeRouteValidator = [
  body('start').optional().notEmpty().withMessage('start location cannot be empty'),
  body('donations').optional().isArray().withMessage('donations must be an array')
];

module.exports = {
  recommendValidator,
  riskValidator,
  priorityValidator,
  demandValidator,
  optimizeRouteValidator
};

