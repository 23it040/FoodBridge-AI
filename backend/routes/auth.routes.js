const express = require('express');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validations/auth.validation');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, asyncHandler(authController.register));
router.post('/login', loginValidator, validateRequest, asyncHandler(authController.login));
router.post('/forgot-password', forgotPasswordValidator, validateRequest, asyncHandler(authController.forgotPassword));
router.post('/reset-password', resetPasswordValidator, validateRequest, asyncHandler(authController.resetPassword));

module.exports = router;
