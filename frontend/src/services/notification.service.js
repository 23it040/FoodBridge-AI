import api from './api';

const extractNotificationsData = (res) => {
  const raw = res?.data || res;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.notifications)
    ? raw.notifications
    : Array.isArray(res?.notifications)
    ? res.notifications
    : [];
  const unreadCount = raw?.unreadCount ?? list.filter((n) => !n.isRead && !n.read).length;
  return { notifications: list, unreadCount, total: raw?.total || list.length };
};

const listNotifications = async (params = {}) => {
  const response = await api.get('/api/notifications', { params });
  return extractNotificationsData(response.data);
};

const getUnreadCount = async () => {
  try {
    const response = await api.get('/api/notifications/unread');
    const raw = response?.data?.data || response?.data;
    return raw?.unreadCount ?? (Array.isArray(raw?.notifications) ? raw.notifications.filter((n) => !n.isRead && !n.read).length : 0);
  } catch (e) {
    console.error('Failed to fetch unread count:', e);
    return 0;
  }
};

const markAsRead = async (id) => {
  const response = await api.patch(`/api/notifications/${id}/read`);
  api.clearCache();
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.patch('/api/notifications/read-all');
  api.clearCache();
  return response.data;
};

const deleteNotification = async (id) => {
  const response = await api.delete(`/api/notifications/${id}`);
  api.clearCache();
  return response.data;
};

export default {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
