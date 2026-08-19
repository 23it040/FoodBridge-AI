import { Notification } from '../models/index.js';

class NotificationRepository {
  create(data) {
    return Notification.create(data);
  }

  createMany(dataArray) {
    return Notification.insertMany(dataArray);
  }

  findById(id) {
    return Notification.findById(id);
  }

  findAll(filter = {}, options = {}) {
    const { skip = 0, limit = 20, sort = '-createdAt' } = options;
    return Notification.find(filter).sort(sort).skip(skip).limit(limit);
  }

  updateById(id, data) {
    return Notification.findByIdAndUpdate(id, data, { new: true });
  }

  markAllRead(userId) {
    return Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  count(filter = {}) {
    return Notification.countDocuments(filter);
  }

  countUnread(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

export default new NotificationRepository();
