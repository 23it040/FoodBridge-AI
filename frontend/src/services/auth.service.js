import api from './api';

const login = async (payload) => {
  const response = await api.post('/api/v1/auth/login', payload);
  return response.data.data;
};

const register = async (payload) => {
  const response = await api.post('/api/v1/auth/register', payload);
  return response.data.data;
};

const forgotPassword = async (payload) => {
  const response = await api.post('/api/v1/auth/forgot-password', payload);
  return response.data.data;
};

export default {
  login,
  register,
  forgotPassword
};
