import api from './api';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.donations)) return res.donations;
  return [];
};

const normalizeDonationItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    name: item.foodName || item.name || 'Food Item',
    foodName: item.foodName || item.name || 'Food Item',
    donorName: item.donorId?.name || item.donorName || item.donorId?.email || 'Donor',
    category: item.category || 'General',
    quantity: item.quantity ?? 1,
    unit: item.unit || 'servings',
    imageUrl: item.foodImage?.url || item.imageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop',
    expiryTime: item.expiryTime ? new Date(item.expiryTime).toLocaleDateString() : 'N/A',
    pickupAddress: item.pickupAddress || 'Address not specified'
  };
};

const listDonations = async (params = {}) => {
  const response = await api.get('/api/food', { params });
  const rawList = extractArray(response.data);
  return rawList.map(normalizeDonationItem);
};

const getDonation = async (id) => {
  const response = await api.get(`/api/food/${id}`);
  const raw = response?.data?.data || response?.data || response;
  return normalizeDonationItem(raw);
};

const getMyDonations = async (params = {}) => {
  const response = await api.get('/api/food', { params });
  const rawList = extractArray(response.data);
  return rawList.map(normalizeDonationItem);
};

const createDonation = async (formData) => {
  const response = await api.post('/api/food', formData);
  api.clearCache();
  return response.data;
};

const updateDonation = async (id, formData) => {
  const response = await api.put(`/api/food/${id}`, formData);
  api.clearCache();
  return response.data;
};

const deleteDonation = async (id) => {
  const response = await api.delete(`/api/food/${id}`);
  api.clearCache();
  return response.data;
};

const cancelDonation = async (id) => {
  return deleteDonation(id);
};

export default {
  listDonations,
  getDonation,
  getMyDonations,
  createDonation,
  updateDonation,
  deleteDonation,
  cancelDonation
};
