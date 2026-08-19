import api from './api';

const getProfile = async () => {
  const response = await api.get('/api/v1/users/profile');
  return response.data;
};

const getProfileCached = async () => {
  const response = await api.getCached('/api/v1/users/profile');
  return response.data;
};

const updateProfile = async (payload) => {
  const response = await api.put('/api/v1/users/profile', payload);
  return response.data;
};

const uploadAvatar = async (formData) => {
  const response = await api.put('/api/v1/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

const changePassword = async (payload) => {
  const response = await api.post('/api/v1/users/change-password', payload);
  return response.data;
};

const deleteAccount = async () => {
  const response = await api.delete('/api/v1/users');
  return response.data;
};

export default {
  getProfile,
  getProfileCached,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount
};
