import api from './api';

const getNearbyNgos = async (lat, lng, radius = 10000) => {
  const response = await api.get('/api/ngos/nearby', {
    params: { lat, lng, radius }
  });
  return response.data;
};

const getNgosForMap = async (params = {}) => {
  const response = await api.get('/api/ngos/map', { params });
  return response.data;
};

export default {
  getNearbyNgos,
  getNgosForMap
};
