const express = require('express');
const ngoController = require('../controllers/ngo.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middleware/upload.middleware');
const {
  registerNgoValidator,
  verifyNgoValidator,
  updateNgoProfileValidator
} = require('../validations/ngo.validation');

const router = express.Router();

/**
 * Public routes
 */
router.post(
  '/register',
  upload.single('profileImage'),
  registerNgoValidator,
  validateRequest,
  asyncHandler(ngoController.registerNgo)
);

/**
 * GET /api/ngos/nearby or /api/ngo/nearby
 * Public route to fetch nearby NGOs from Overpass API
 * Query params: lat, lng, radius
 */
router.get('/nearby', asyncHandler(ngoController.getNearbyNgos));
router.get('/nearby-ngos', asyncHandler(ngoController.getNearbyNgos));

/**
 * Authenticated routes
 */
router.use(authenticate);
router.use(authorizeRoles('ngo', 'admin'));

router.get('/profile', asyncHandler(ngoController.getProfile));

router.put(
  '/profile',
  upload.single('profileImage'),
  updateNgoProfileValidator,
  validateRequest,
  asyncHandler(ngoController.updateProfile)
);

router.get('/dashboard', asyncHandler(ngoController.getDashboard));

router.get('/nearby-food', asyncHandler(ngoController.getNearbyFood));

router.get('/history', asyncHandler(ngoController.getHistory));

router.put(
  '/:id/verification',
  authorizeRoles('admin'),
  verifyNgoValidator,
  validateRequest,
  asyncHandler(ngoController.verifyNgo)
);

module.exports = router;
