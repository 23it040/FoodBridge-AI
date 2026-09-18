import api from './api';

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.requests)) return res.requests;
  return [];
};

const normalizeRequestItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  const foodObj = (item.foodId && typeof item.foodId === 'object') ? item.foodId : null;
  const donorObj = (item.donorId && typeof item.donorId === 'object') ? item.donorId : null;
  const ngoObj = (item.ngoId && typeof item.ngoId === 'object') ? item.ngoId : null;
  const itemId = item._id ? String(item._id) : (item.id ? String(item.id) : undefined);

  return {
    ...item,
    _id: itemId || item._id,
    id: itemId || item.id,
    foodName: foodObj?.foodName || foodObj?.name || item.foodName || item.donationName || null,
    donationName: foodObj?.foodName || foodObj?.name || item.foodName || item.donationName || null,
    donorName: donorObj?.name || item.donorName || donorObj?.email || null,
    ngoName: ngoObj?.name || item.ngoName || ngoObj?.email || null,
    category: foodObj?.category || item.category || null,
    quantity: foodObj?.quantity ?? item.quantity ?? null,
    unit: foodObj?.unit || item.unit || '',
    pickupAddress: foodObj?.pickupAddress || item.pickupAddress || null,
    message: item.requestMessage || item.message || ''
  };
};

const listRequests = async (params = {}) => {
  const response = await api.get('/api/requests', { params });
  const rawList = extractArray(response.data);
  return rawList.map(normalizeRequestItem);
};

const getRequest = async (id) => {
  const response = await api.get(`/api/requests/${id}`);
  const raw = response?.data?.data || response?.data || response;
  return normalizeRequestItem(raw);
};

const respondToRequest = async (id, payload) => {
  const response = await api.put(`/api/requests/${id}/status`, payload);
  return response.data;
};

const updateRequestStatus = async (id, status, extra = {}) => {
  const payload = typeof status === 'object' ? status : { status, ...extra };
  return respondToRequest(id, payload);
};

const normalizeRequestPayload = (payload = {}) => {
  const normalized = { ...payload };

  if (!normalized.foodId && normalized.donationId) {
    normalized.foodId = normalized.donationId;
  }

  if (!normalized.requestMessage && normalized.message) {
    normalized.requestMessage = normalized.message;
  }

  if (!normalized.pickupDate) {
    normalized.pickupDate = new Date().toISOString();
  }

  if (!normalized.pickupTime) {
    normalized.pickupTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (normalized.requestMessage) {
    normalized.requestMessage = normalized.requestMessage.trim();
  }

  if (normalized.contactNumber) {
    normalized.contactNumber = normalized.contactNumber.trim();
  }

  if (normalized.beneficiaries !== undefined) {
    normalized.beneficiaries = Math.max(1, Number(normalized.beneficiaries) || 1);
  }

  return normalized;
};

const createRequest = async (payload) => {
  const response = await api.post('/api/requests', normalizeRequestPayload(payload));
  return response.data;
};

const createDemandRequest = async (payload) => {
  return createRequest(payload);
};

const createPickupRequest = async (payload) => {
  return createRequest(payload);
};

export default {
  listRequests,
  getRequest,
  respondToRequest,
  updateRequestStatus,
  createRequest,
  createDemandRequest,
  createPickupRequest
};
