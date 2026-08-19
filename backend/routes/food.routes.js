const express = require('express');
const foodDonationController = require('../controllers/foodDonation.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middleware/upload.middleware');
const {
  createFoodDonationValidator,
  updateFoodDonationValidator
} = require('../validations/food.validation');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  upload.single('foodImage'),
  createFoodDonationValidator,
  validateRequest,
  asyncHandler(foodDonationController.createDonation)
);
router.get('/', asyncHandler(foodDonationController.listDonations));
router.get('/:id', asyncHandler(foodDonationController.getDonation));
router.put(
  '/:id',
  upload.single('foodImage'),
  updateFoodDonationValidator,
  validateRequest,
  asyncHandler(foodDonationController.updateDonation)
);
router.delete('/:id', asyncHandler(foodDonationController.deleteDonation));

module.exports = router;
