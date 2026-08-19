const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.resolve(__dirname, '../../ai-service/model_reports/model_registry.json');
const MONITORING_LOG_PATH = path.resolve(__dirname, '../../ai-service/model_reports/model_monitoring.json');

// In-memory prediction metrics tracker
const monitoringStore = {
  demand: { totalRequests: 0, successfulPredictions: 0, insufficientDataRequests: 0, failures: 0, lastPredictionAt: null },
  risk: { totalRequests: 0, successfulPredictions: 0, insufficientDataRequests: 0, failures: 0, lastPredictionAt: null },
  priority: { totalRequests: 0, successfulPredictions: 0, insufficientDataRequests: 0, failures: 0, lastPredictionAt: null }
};

const getModelRegistry = () => {
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[aiGovernanceService] Error reading model registry:', err.message);
  }
  return null;
};

const getCentralModelStatus = () => {
  const registry = getModelRegistry() || {};

  const demandReg = registry.demand || {};
  const riskReg = registry.risk || {};
  const priorityReg = registry.priority || {};

  return {
    models: [
      {
        id: 'demand',
        name: 'Demand Prediction',
        status: demandReg.status || 'EXTERNAL_DATA_MODEL',
        version: demandReg.version || '1.0.0',
        foodBridgeTrained: demandReg.foodBridgeTrained ?? false,
        dataSource: demandReg.dataset || 'Kaggle Food Demand Forecasting',
        algorithm: demandReg.algorithm || 'gradient_boosting',
        metrics: demandReg.testMetrics || null
      },
      {
        id: 'risk',
        name: 'Food Risk Prediction',
        status: riskReg.status || 'EXTERNAL_DATA_MODEL',
        version: riskReg.version || '1.0.0',
        foodBridgeTrained: riskReg.foodBridgeTrained ?? false,
        dataSource: 'Public Milk Quality Dataset',
        scope: riskReg.scope || 'Milk quality classification',
        algorithm: riskReg.algorithm || 'random_forest',
        metrics: riskReg.testMetrics || null
      },
      {
        id: 'priority',
        name: 'Donation Priority',
        status: priorityReg.status || 'INSUFFICIENT_DATA',
        version: priorityReg.version || '1.0.0',
        foodBridgeTrained: priorityReg.foodBridgeTrained ?? false,
        dataSource: 'FoodBridge MongoDB',
        scope: priorityReg.scope || 'FoodBridge operational pickup priority',
        algorithm: priorityReg.algorithm || 'None (Training Blocked)',
        recordsAvailable: priorityReg.recordsAvailable ?? 0,
        minimumRequired: priorityReg.minimumRequired ?? 500
      },
      {
        id: 'recommendation',
        name: 'NGO Recommendation',
        status: 'LIVE_RULE_BASED',
        version: '1.0.0',
        foodBridgeTrained: false,
        dataSource: 'MongoDB Verified NGOs + OpenStreetMap Overpass'
      },
      {
        id: 'route',
        name: 'Route Optimization',
        status: 'LIVE_ALGORITHMIC',
        version: '1.0.0',
        foodBridgeTrained: false,
        dataSource: 'Real Geographic Coordinates & Routing Algorithms'
      }
    ]
  };
};

const getAiCapabilities = () => {
  const registry = getModelRegistry() || {};

  const demandReg = registry.demand || {};
  const riskReg = registry.risk || {};
  const priorityReg = registry.priority || {};

  return {
    demand: {
      name: 'Demand Prediction',
      status: demandReg.status || 'EXTERNAL_DATA_MODEL',
      version: demandReg.version || '1.0.0',
      available: true,
      foodBridgeTrained: demandReg.foodBridgeTrained ?? false,
      dataSource: demandReg.dataset || 'Kaggle Food Demand Forecasting',
      description: 'Predicts regional food demand using Gradient Boosting trained on Kaggle dataset.',
      limitations: 'External benchmark model. Not yet trained on FoodBridge historical transaction records.'
    },
    risk: {
      name: 'Food Quality Risk',
      status: riskReg.status || 'EXTERNAL_DATA_MODEL',
      version: riskReg.version || '1.0.0',
      available: true,
      foodBridgeTrained: riskReg.foodBridgeTrained ?? false,
      dataSource: 'Public Milk Quality Dataset',
      description: 'Assesses milk quality using Random Forest Classifier trained on sensor measurements.',
      limitations: 'Scope limited strictly to milk quality with required physical pH/turbidity sensor inputs.'
    },
    priority: {
      name: 'Donation Priority',
      status: priorityReg.status || 'INSUFFICIENT_DATA',
      version: priorityReg.version || '1.0.0',
      available: false,
      foodBridgeTrained: priorityReg.foodBridgeTrained ?? false,
      dataSource: 'FoodBridge MongoDB',
      description: 'Calculates operational pickup priority based on historical transaction sequences.',
      limitations: 'Model training blocked because FoodBridge MongoDB has < 500 verified completed pickup records.'
    },
    recommendation: {
      name: 'NGO Recommendation',
      status: 'LIVE_RULE_BASED',
      version: '1.0.0',
      available: true,
      foodBridgeTrained: false,
      dataSource: 'MongoDB Verified NGOs + OpenStreetMap Overpass',
      description: 'Ranks nearest active NGOs using live distance and capability scoring.',
      limitations: 'Rule-based matching engine.'
    },
    routeOptimization: {
      name: 'Route Optimization',
      status: 'LIVE_ALGORITHMIC',
      version: '1.0.0',
      available: true,
      foodBridgeTrained: false,
      dataSource: 'Real Geographic Coordinates & Routing Graph Algorithms',
      description: 'Calculates optimal pickup route using real donor and NGO coordinates.',
      limitations: 'Algorithmic routing based on physical location.'
    }
  };
};

const recordAiInference = (modelKey, isSuccessful, isInsufficientData = false) => {
  if (!monitoringStore[modelKey]) {
    monitoringStore[modelKey] = { totalRequests: 0, successfulPredictions: 0, insufficientDataRequests: 0, failures: 0, lastPredictionAt: null };
  }

  const store = monitoringStore[modelKey];
  store.totalRequests += 1;
  if (isSuccessful) store.successfulPredictions += 1;
  if (isInsufficientData) store.insufficientDataRequests += 1;
  if (!isSuccessful && !isInsufficientData) store.failures += 1;
  store.lastPredictionAt = new Date().toISOString();
};

const getModelMonitoringStats = () => {
  return {
    timestamp: new Date().toISOString(),
    monitoring: monitoringStore
  };
};

module.exports = {
  getModelRegistry,
  getCentralModelStatus,
  getAiCapabilities,
  recordAiInference,
  getModelMonitoringStats
};
