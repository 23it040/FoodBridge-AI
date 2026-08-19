const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production';

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

const registerUser = async ({ name, email, password, role }) => {
  if (role === 'admin') {
    throw new ApiError(403, 'Public admin registration is not allowed');
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'Email is already in use');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || 'user'
  });
  return user;
};

const authenticateUser = async ({ email, password }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return user;
};

const forgotPassword = async ({ email }) => {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = await bcrypt.hash(resetToken, 12);

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const emailConfigured = Boolean(process.env.SMTP_HOST || process.env.EMAIL_HOST || process.env.MAILER_SERVICE);
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!emailConfigured && isDevelopment) {
    return { resetToken };
  }

  return { message: 'Password reset link sent to your email' };
};

const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required');
  }

  const users = await User.find({ resetPasswordExpires: { $gt: Date.now() } }).select('+resetPasswordToken +resetPasswordExpires');
  const matchedUser = await Promise.all(users.map(async (user) => {
    if (!user.resetPasswordToken) {
      return null;
    }

    const isValidToken = await bcrypt.compare(token, user.resetPasswordToken);
    return isValidToken ? user : null;
  })).then((results) => results.find(Boolean));

  if (!matchedUser) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  matchedUser.password = newPassword;
  matchedUser.resetPasswordToken = undefined;
  matchedUser.resetPasswordExpires = undefined;
  await matchedUser.save();

  return matchedUser;
};

module.exports = {
  generateToken,
  registerUser,
  authenticateUser,
  forgotPassword,
  resetPassword
};
