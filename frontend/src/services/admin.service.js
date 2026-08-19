import api from './api';

const getDashboard = async () => {
  const response = await api.get('/api/admin/dashboard');
  return response.data;
};

const listUsers = async (params = {}) => {
  const response = await api.get('/api/admin/users', { params });
  return response.data;
};

const getUser = async (id) => {
  const response = await api.get(`/api/admin/users/${id}`);
  return response.data;
};

const updateUser = async (id, payload) => {
  const response = await api.put(`/api/admin/users/${id}`, payload);
  return response.data;
};

const updateUserStatus = async (id, payload) => {
  const response = await api.patch(`/api/admin/users/${id}/status`, payload);
  return response.data;
};

const listPendingNgos = async (params = {}) => {
  const response = await api.get('/api/admin/ngos/pending', { params });
  return response.data;
};

const approveNgo = async (id, reason = 'Verification approved') => {
  const response = await api.patch(`/api/admin/ngos/${id}/approve`, { reason });
  return response.data;
};

const rejectNgo = async (id, reason = 'Verification criteria not met') => {
  const response = await api.patch(`/api/admin/ngos/${id}/reject`, { reason });
  return response.data;
};

const suspendNgo = async (id, reason = 'Suspended by admin') => {
  const response = await api.patch(`/api/admin/ngos/${id}/suspend`, { reason });
  return response.data;
};

const listDonationsAdmin = async (params = {}) => {
  const response = await api.get('/api/admin/donations', { params });
  return response.data;
};

const listRequestsAdmin = async (params = {}) => {
  const response = await api.get('/api/admin/requests', { params });
  return response.data;
};

const listAuditLogs = async (params = {}) => {
  const response = await api.get('/api/admin/audit-logs', { params });
  return response.data;
};

const listReports = async (params = {}) => {
  const response = await api.get('/api/admin/reports/overview', { params });
  return response.data;
};

const getAnalytics = async () => {
  const response = await api.get('/api/admin/analytics');
  return response.data;
};

const createNotification = async (payload) => {
  const response = await api.post('/api/admin/notifications', payload);
  return response.data;
};

export default {
  getDashboard,
  listUsers,
  getUser,
  updateUser,
  updateUserStatus,
  listPendingNgos,
  approveNgo,
  rejectNgo,
  suspendNgo,
  listDonationsAdmin,
  listRequestsAdmin,
  listAuditLogs,
  listReports,
  getAnalytics,
  createNotification
};
