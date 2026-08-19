const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const asyncHandler = require('../utils/asyncHandler');
const aiController = require('../controllers/ai.controller');
const {
  recommendValidator,
  riskValidator,
  priorityValidator,
  demandValidator,
  optimizeRouteValidator
} = require('../validations/ai.validation');

const router = express.Router();

router.use(authenticate);

// Governance, Monitoring, Data Quality & Readiness Endpoints
router.get('/model-status', asyncHandler(aiController.getModelStatus));
router.get('/model-health', asyncHandler(aiController.getModelHealth));
router.get('/capabilities', asyncHandler(aiController.getCapabilities));
router.get('/data-quality', asyncHandler(aiController.getDataQuality));
router.get('/retraining-status', asyncHandler(aiController.getRetrainingStatus));
router.post('/retrain-readiness', asyncHandler(aiController.checkRetrainReadiness));
router.post('/retraining/check', asyncHandler(aiController.checkRetrainingCheck));
router.post('/models/:model/rollback', asyncHandler(aiController.rollbackModel));
router.get('/priority-data-readiness', asyncHandler(aiController.getPriorityDataReadiness));
router.get('/demand-data-readiness', asyncHandler(aiController.getDemandDataReadiness));
router.get('/risk-data-readiness', asyncHandler(aiController.getRiskDataReadiness));
router.get('/model-monitoring', asyncHandler(aiController.getModelMonitoring));

// Decision Engine Endpoints
router.get('/decision/:donationId', asyncHandler(aiController.getDecision));
router.get('/decision', asyncHandler(aiController.getDecision));
router.post('/decision', asyncHandler(aiController.getDecision));

// Inference Endpoints
router.post('/recommend', recommendValidator, validateRequest, asyncHandler(aiController.recommend));
router.post('/risk-score', riskValidator, validateRequest, asyncHandler(aiController.riskScore));
router.post('/priority-score', priorityValidator, validateRequest, asyncHandler(aiController.priorityScore));
router.post('/predict-demand', demandValidator, validateRequest, asyncHandler(aiController.predictDemand));
router.post('/optimize-route', optimizeRouteValidator, validateRequest, asyncHandler(aiController.optimizeRoute));

module.exports = router;
