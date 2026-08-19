const express = require('express');
const foodRequestController = require('../controllers/foodRequest.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  createFoodRequestValidator,
  updateFoodRequestStatusValidator
} = require('../validations/foodRequest.validation');

/**
 * Food Request API
 * POST    /api/requests
 * GET     /api/requests
 * GET     /api/requests/:id
 * PUT     /api/requests/:id/status
 * DELETE  /api/requests/:id
 */

const router = express.Router();

// Routes for food request management
router.use(authenticate);

// Only NGOs can create new requests
router.post(
  '/',
  authorizeRoles('partner', 'ngo'),
  createFoodRequestValidator,
  validateRequest,
  asyncHandler(foodRequestController.createRequest)
);

router.get('/', asyncHandler(foodRequestController.listRequests));
router.get('/:id', asyncHandler(foodRequestController.getRequest));
router.put(
  '/:id/status',
  updateFoodRequestStatusValidator,
  validateRequest,
  asyncHandler(foodRequestController.updateRequestStatus)
);
router.delete('/:id', asyncHandler(foodRequestController.deleteRequest));

module.exports = router;
