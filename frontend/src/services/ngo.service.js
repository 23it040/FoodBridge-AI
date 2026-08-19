import api from './api';

const getNearbyNgos = async (lat, lng, radius = 10000) => {
  const response = await api.get('/api/ngos/nearby', {
    params: { lat, lng, radius }
  });
  return response.data;
};

export default {
  getNearbyNgos
};
