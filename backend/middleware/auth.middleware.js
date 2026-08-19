const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token required');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new ApiError(401, 'Invalid authorization token');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Account is not active');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Session expired. Please log in again.'));
    }
    next(new ApiError(401, error.message || 'Not authorized')); 
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized')); 
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied')); 
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles
};
