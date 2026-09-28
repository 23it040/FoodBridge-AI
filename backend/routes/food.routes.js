const express = require('express');
const foodDonationController = require('../controllers/foodDonation.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middleware/upload.middleware');
const {
  createFoodDonationValidator,
  updateFoodDonationValidator
} = require('../validations/food.validation');

const router = express.Router();

// Public / optionally authenticated routes
router.get('/', optionalAuthenticate, asyncHandler(foodDonationController.listDonations));
router.get('/:id', optionalAuthenticate, asyncHandler(foodDonationController.getDonation));

// Authenticated routes
router.post(
  '/',
  authenticate,
  upload.single('foodImage'),
  createFoodDonationValidator,
  validateRequest,
  asyncHandler(foodDonationController.createDonation)
);
router.get('/:id/matches', authenticate, asyncHandler(foodDonationController.getDonationMatches));
router.put(
  '/:id',
  authenticate,
  upload.single('foodImage'),
  updateFoodDonationValidator,
  validateRequest,
  asyncHandler(foodDonationController.updateDonation)
);
router.delete('/:id', authenticate, asyncHandler(foodDonationController.deleteDonation));

module.exports = router;

