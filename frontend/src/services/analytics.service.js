import api from './api';

const getDonorAnalytics = async () => {
  const response = await api.get('/api/users/dashboard');
  return response.data;
};

const getNgoAnalytics = async () => {
  const response = await api.get('/api/ngo/dashboard');
  return response.data;
};

export default {
  getDonorAnalytics,
  getNgoAnalytics
};
