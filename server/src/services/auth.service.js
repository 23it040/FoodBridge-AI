import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.util.js';
import { sanitizeUser } from '../utils/helpers.js';
import userRepository from '../repositories/user.repository.js';
import { USER_ROLES } from '../constants/enums.js';

class AuthService {
  async register(payload) {
    const existingUser = await userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw ApiError.conflict('Email is already registered');
    }

    if (payload.role === USER_ROLES.DONOR && !payload.profile?.donorType) {
      throw ApiError.badRequest('Donor type is required for donor accounts');
    }

    const passwordHash = await bcrypt.hash(payload.password, env.bcryptSaltRounds);

    const user = await userRepository.create({
      email: payload.email,
      passwordHash,
      role: payload.role,
      profile: payload.profile,
    });

    const tokens = generateTokenPair(user);
    await userRepository.updateById(user._id, { refreshToken: tokens.refreshToken });

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email, true);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account has been deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = generateTokenPair(user);
    await userRepository.updateById(user._id, {
      refreshToken: tokens.refreshToken,
      lastLoginAt: new Date(),
    });

    return {
      user: sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken) {
    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepository.findByIdWithPassword(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account has been deactivated');
    }

    const tokens = generateTokenPair(user);
    await userRepository.updateById(user._id, { refreshToken: tokens.refreshToken });

    return tokens;
  }

  async logout(userId) {
    await userRepository.updateById(userId, { refreshToken: null });
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
    await userRepository.updateById(userId, { passwordHash });

    return { message: 'Password updated successfully' };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return sanitizeUser(user);
  }
}

export default new AuthService();
