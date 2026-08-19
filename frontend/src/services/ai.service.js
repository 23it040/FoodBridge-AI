import api from './api';

const recommend = async (payload) => {
  const response = await api.post('/api/ai/recommend', payload);
  return response.data;
};

const riskScore = async (payload) => {
  const response = await api.post('/api/ai/risk-score', payload);
  return response.data;
};

const priorityScore = async (payload) => {
  const response = await api.post('/api/ai/priority-score', payload);
  return response.data;
};

const predictDemand = async (payload) => {
  const response = await api.post('/api/ai/predict-demand', payload);
  return response.data;
};

const optimizeRoute = async (payload) => {
  const response = await api.post('/api/ai/optimize-route', payload);
  return response.data;
};

const getModelStatus = async () => {
  const response = await api.get('/api/ai/model-status');
  return response.data;
};

const getCapabilities = async () => {
  const response = await api.get('/api/ai/capabilities');
  return response.data;
};

const getDataQuality = async () => {
  const response = await api.get('/api/ai/data-quality');
  return response.data;
};

const checkRetrainReadiness = async () => {
  const response = await api.post('/api/ai/retrain-readiness');
  return response.data;
};

const getPriorityDataReadiness = async () => {
  const response = await api.get('/api/ai/priority-data-readiness');
  return response.data;
};

const getDemandDataReadiness = async () => {
  const response = await api.get('/api/ai/demand-data-readiness');
  return response.data;
};

const getRiskDataReadiness = async () => {
  const response = await api.get('/api/ai/risk-data-readiness');
  return response.data;
};

const getModelMonitoring = async () => {
  const response = await api.get('/api/ai/model-monitoring');
  return response.data;
};

const getDecision = async (donationId, options = {}) => {
  const url = donationId ? `/api/ai/decision/${donationId}` : '/api/ai/decision';
  const response = await api.get(url, { params: options });
  return response.data;
};

const getDecisionPayload = async (payload) => {
  const response = await api.post('/api/ai/decision', payload);
  return response.data;
};

const getModelHealth = async () => {
  const response = await api.get('/api/ai/model-health');
  return response.data;
};

const getRetrainingStatus = async () => {
  const response = await api.get('/api/ai/retraining-status');
  return response.data;
};

const checkRetrainingCheck = async () => {
  const response = await api.post('/api/ai/retraining/check');
  return response.data;
};

const rollbackModel = async (modelName) => {
  const response = await api.post(`/api/ai/models/${modelName}/rollback`);
  return response.data;
};

export default {
  recommend,
  riskScore,
  priorityScore,
  predictDemand,
  optimizeRoute,
  getModelStatus,
  getCapabilities,
  getDataQuality,
  checkRetrainReadiness,
  getPriorityDataReadiness,
  getDemandDataReadiness,
  getRiskDataReadiness,
  getModelMonitoring,
  getDecision,
  getDecisionPayload,
  getModelHealth,
  getRetrainingStatus,
  checkRetrainingCheck,
  rollbackModel
};
