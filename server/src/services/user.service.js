import ApiError from '../utils/ApiError.js';
import { sanitizeUser, buildPagination, getPaginationParams } from '../utils/helpers.js';
import userRepository from '../repositories/user.repository.js';
import cloudinaryService from './cloudinary.service.js';
import notificationService from './notification.service.js';
import { USER_ROLES, VERIFICATION_STATUS, NOTIFICATION_TYPES } from '../constants/enums.js';

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return sanitizeUser(user);
  }

  async updateProfile(userId, payload) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updateData = {};

    if (payload.profile) {
      updateData.profile = {
        ...user.profile?.toObject?.() || user.profile || {},
        ...payload.profile,
      };

      if (payload.profile.address) {
        updateData.profile.address = {
          ...(user.profile?.address?.toObject?.() || user.profile?.address || {}),
          ...payload.profile.address,
        };
      }

      if (payload.profile.location) {
        updateData.profile.location = payload.profile.location;
      }
    }

    const updated = await userRepository.updateById(userId, updateData);
    return sanitizeUser(updated);
  }

  async uploadAvatar(userId, file) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const uploaded = await cloudinaryService.uploadImage(file, 'avatars');

    if (user.profile?.avatar?.publicId) {
      await cloudinaryService.deleteImage(user.profile.avatar.publicId);
    }

    const updated = await userRepository.updateById(userId, {
      'profile.avatar': uploaded,
    });

    return sanitizeUser(updated);
  }

  async uploadDocument(userId, file, documentType) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const uploaded = await cloudinaryService.uploadImage(file, 'documents');

    const document = {
      url: uploaded.url,
      publicId: uploaded.publicId,
      type: documentType,
      uploadedAt: new Date(),
    };

    const updated = await userRepository.updateById(userId, {
      $push: { 'profile.documents': document },
    });

    return sanitizeUser(updated);
  }

  async listUsers(query) {
    const { page, limit, skip } = getPaginationParams(query);
    const filter = { isActive: true };

    if (query.role) filter.role = query.role;
    if (query.verificationStatus) {
      filter['profile.verificationStatus'] = query.verificationStatus;
    }
    if (query.search) {
      filter.$or = [
        { email: { $regex: query.search, $options: 'i' } },
        { 'profile.organizationName': { $regex: query.search, $options: 'i' } },
        { 'profile.contactPerson': { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      userRepository.findAll(filter, { skip, limit, sort: '-createdAt' }),
      userRepository.count(filter),
    ]);

    return {
      users: users.map(sanitizeUser),
      pagination: buildPagination(page, limit, total),
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return sanitizeUser(user);
  }

  async updateVerificationStatus(adminId, userId, payload) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isVerified = payload.verificationStatus === VERIFICATION_STATUS.APPROVED;

    const updated = await userRepository.updateById(userId, {
      isVerified,
      'profile.verificationStatus': payload.verificationStatus,
      'profile.verificationNote': payload.verificationNote || '',
    });

    await notificationService.create({
      userId,
      type: NOTIFICATION_TYPES.VERIFICATION,
      title: isVerified ? 'Account Verified' : 'Verification Update',
      message: isVerified
        ? 'Your account has been verified. You can now access all platform features.'
        : `Your verification was ${payload.verificationStatus}. ${payload.verificationNote || ''}`.trim(),
      metadata: { extra: { updatedBy: adminId } },
      priority: 'high',
    });

    return sanitizeUser(updated);
  }

  async deactivateUser(adminId, userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.role === USER_ROLES.ADMIN) {
      throw ApiError.forbidden('Cannot deactivate admin accounts');
    }

    const updated = await userRepository.updateById(userId, {
      isActive: false,
      refreshToken: null,
    });

    return sanitizeUser(updated);
  }
}

export default new UserService();
