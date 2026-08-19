import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import userRepository from '../repositories/user.repository.js';

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await userRepository.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Access token has expired'));
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid access token'));
      return;
    }
    next(error);
  }
};

export const optionalAuthenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.id);

    if (user?.isActive) {
      req.user = user;
    }

    next();
  } catch {
    next();
  }
};
