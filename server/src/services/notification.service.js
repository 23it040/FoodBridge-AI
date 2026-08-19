import ApiError from '../utils/ApiError.js';
import { buildPagination, getPaginationParams } from '../utils/helpers.js';
import notificationRepository from '../repositories/notification.repository.js';

class NotificationService {
  async create(payload) {
    return notificationRepository.create(payload);
  }

  async createMany(payloads) {
    if (!payloads.length) return [];
    return notificationRepository.createMany(payloads);
  }

  async list(userId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const filter = { userId };

    if (query.isRead !== undefined) {
      filter.isRead = query.isRead;
    }
    if (query.type) {
      filter.type = query.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      notificationRepository.findAll(filter, { skip, limit }),
      notificationRepository.count(filter),
      notificationRepository.countUnread(userId),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: buildPagination(page, limit, total),
    };
  }

  async markAsRead(userId, notificationId) {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    if (notification.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only update your own notifications');
    }

    if (notification.isRead) {
      return notification;
    }

    return notificationRepository.updateById(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  async markAllAsRead(userId) {
    const result = await notificationRepository.markAllRead(userId);
    return { modifiedCount: result.modifiedCount };
  }

  async delete(userId, notificationId) {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    if (notification.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own notifications');
    }

    await notification.deleteOne();
    return { message: 'Notification deleted' };
  }
}

export default new NotificationService();
