import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const cache = new Map();

const getCacheKey = (url, params) => {
  const sortedParams = params
    ? JSON.stringify(
        Object.keys(params)
          .sort()
          .reduce((acc, key) => {
            acc[key] = params[key];
            return acc;
          }, {})
      )
    : '';
  return `${url}?${sortedParams}`;
};

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

api.getCached = async (url, config = {}, ttl = 60000) => {
  const key = getCacheKey(url, config.params);
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.response;
  }

  const response = await api.get(url, config);
  cache.set(key, { response, expiry: Date.now() + ttl });
  return response;
};

api.clearCache = () => cache.clear();

export default api;
