const aiService = require('../services/ai.service');
const aiGovernanceService = require('../services/aiGovernance.service');
const aiDataReadinessService = require('../services/aiDataReadiness.service');
const aiDecisionService = require('../services/aiDecision.service');
const ApiResponse = require('../utils/ApiResponse');

const recommend = async (req, res) => {
  const result = await aiService.recommend(req.body);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI recommendations retrieved successfully',
      data: result
    })
  );
};

const riskScore = async (req, res) => {
  const result = await aiService.riskScore(req.body);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI risk score retrieved successfully',
      data: result
    })
  );
};

const priorityScore = async (req, res) => {
  const result = await aiService.priorityScore(req.body);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI priority score retrieved successfully',
      data: result
    })
  );
};

const predictDemand = async (req, res) => {
  const result = await aiService.predictDemand(req.body);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI demand forecast retrieved successfully',
      data: result
    })
  );
};

const optimizeRoute = async (req, res) => {
  const result = await aiService.optimizeRoute(req.body);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI route optimization retrieved successfully',
      data: result
    })
  );
};

const getModelStatus = async (req, res) => {
  const statusData = aiGovernanceService.getCentralModelStatus();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI Model Registry status retrieved successfully',
      data: statusData
    })
  );
};

const getCapabilities = async (req, res) => {
  const capabilities = aiGovernanceService.getAiCapabilities();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI Capabilities retrieved successfully',
      data: capabilities
    })
  );
};

const getDataQuality = async (req, res) => {
  const quality = await aiDataReadinessService.getDataQualityMetrics();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Data Quality metrics retrieved successfully',
      data: quality
    })
  );
};

const checkRetrainReadiness = async (req, res) => {
  const readiness = await aiDataReadinessService.getRetrainReadiness();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Retraining readiness check completed successfully',
      data: readiness
    })
  );
};

const getPriorityDataReadiness = async (req, res) => {
  const readiness = await aiDataReadinessService.getPriorityDataReadiness();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Priority data readiness retrieved successfully',
      data: readiness
    })
  );
};

const getDemandDataReadiness = async (req, res) => {
  const readiness = await aiDataReadinessService.getDemandDataReadiness();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Demand data readiness retrieved successfully',
      data: readiness
    })
  );
};

const getRiskDataReadiness = async (req, res) => {
  const readiness = await aiDataReadinessService.getRiskDataReadiness();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Risk data readiness retrieved successfully',
      data: readiness
    })
  );
};

const getModelMonitoring = async (req, res) => {
  const monitoring = aiGovernanceService.getModelMonitoringStats();
  const operational = await aiDataReadinessService.getOperationalOutcomeMetrics();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI Model Monitoring and Operational metrics retrieved successfully',
      data: { ...monitoring, operational }
    })
  );
};

const getDecision = async (req, res) => {
  const donationId = req.params.donationId || req.body.donationId;
  const result = await aiDecisionService.getAiDecisionForDonation(donationId, req.user, req.body || {});
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI Redistribution Decision retrieved successfully',
      data: result
    })
  );
};

const getModelHealth = async (req, res) => {
  const aiMonitoringService = require('../services/aiMonitoring.service');
  const health = await aiMonitoringService.getModelHealth();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI Model Health retrieved successfully',
      data: health
    })
  );
};

const getRetrainingStatus = async (req, res) => {
  const aiMonitoringService = require('../services/aiMonitoring.service');
  const status = await aiMonitoringService.getRetrainingStatus();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'AI Retraining Status retrieved successfully',
      data: status
    })
  );
};

const checkRetrainingCheck = async (req, res) => {
  const aiMonitoringService = require('../services/aiMonitoring.service');
  const result = await aiMonitoringService.checkRetrainingReadiness();
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Retraining readiness check completed',
      data: result
    })
  );
};

const rollbackModel = async (req, res) => {
  const aiMonitoringService = require('../services/aiMonitoring.service');
  const result = await aiMonitoringService.rollbackModel(req.params.model, req.user);
  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: `Model rollback evaluation completed for ${req.params.model}`,
      data: result
    })
  );
};

module.exports = {
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
  getModelHealth,
  getRetrainingStatus,
  checkRetrainingCheck,
  rollbackModel
};
