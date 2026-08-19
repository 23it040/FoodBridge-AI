const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  updateProfileValidator,
  changePasswordValidator
} = require('../validations/user.validation');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', asyncHandler(userController.getDonorDashboard));
router.get('/profile', asyncHandler(userController.getProfile));
router.put(
  '/profile',
  upload.single('avatar'),
  updateProfileValidator,
  validateRequest,
  asyncHandler(userController.updateProfile)
);
router.post('/change-password', changePasswordValidator, validateRequest, asyncHandler(userController.changePassword));
router.delete('/', asyncHandler(userController.deleteAccount));
router.get('/', authorizeRoles('admin'), asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
}));

module.exports = router;
