import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiActivity, 
  FiCpu, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiRefreshCw, 
  FiDatabase, 
  FiLock, 
  FiTrendingUp, 
  FiSlash,
  FiShield
} from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import aiService from '../../services/ai.service';

const AIModelMonitoring = () => {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [retrainingStatus, setRetrainingStatus] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const [healthRes, statusRes] = await Promise.all([
        aiService.getModelHealth().catch(() => null),
        aiService.getRetrainingStatus().catch(() => null)
      ]);

      if (healthRes && healthRes.data) {
        setHealthData(healthRes.data);
      }
      if (statusRes && statusRes.data) {
        setRetrainingStatus(statusRes.data.priority || null);
      }
    } catch (err) {
      toast.error('Failed to load AI model monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const handleCheckRetraining = async () => {
    try {
      setCheckLoading(true);
      const res = await aiService.checkRetrainingCheck();
      if (res && res.data) {
        toast.success(`Retraining check: ${res.data.evaluationStatus}`);
        fetchMonitoringData();
      }
    } catch (err) {
      toast.error('Failed to execute retraining check');
    } finally {
      setCheckLoading(false);
    }
  };

  const getHealthBadge = (healthStatus) => {
    switch (healthStatus) {
      case 'HEALTHY':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><FiCheckCircle className="mr-1" /> HEALTHY</span>;
      case 'INSUFFICIENT_DATA':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><FiAlertTriangle className="mr-1" /> INSUFFICIENT DATA</span>;
      case 'NO_PRODUCTION_DATA':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><FiActivity className="mr-1" /> NO PRODUCTION DATA</span>;
      case 'MODEL_UNAVAILABLE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"><FiSlash className="mr-1" /> MODEL UNAVAILABLE</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{healthStatus || 'UNKNOWN'}</span>;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="AI Model Monitoring & Governance" 
        subtitle="Real-time capability health, live production data readiness, drift status, and safe retraining controls."
      >
        <Button onClick={fetchMonitoringData} variant="outline" size="sm" isLoading={loading}>
          <FiRefreshCw className="mr-2" /> Refresh Status
        </Button>
      </PageHeader>

      {/* Model Capabilities Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthData && Object.entries(healthData).map(([key, info]) => (
          <Card key={key} className="p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold capitalize text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCpu className="text-indigo-500" /> {key} Model
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Version: {info.version || '1.0.0'} | {info.dataSource}
                </p>
              </div>
              {getHealthBadge(info.healthStatus)}
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Model Type Status:</span>
                <span className="font-semibold">{info.status}</span>
              </div>
              <div className="flex justify-between">
                <span>FoodBridge Trained:</span>
                <span className={info.foodBridgeTrained ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                  {info.foodBridgeTrained ? "Yes (MongoDB)" : "No (External/Rules)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Predictions Logged:</span>
                <span className="font-mono">{info.predictionCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Error Count:</span>
                <span className="font-mono text-rose-500">{info.errorCount || 0}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Last Prediction:</span>
                <span>{info.lastPredictionAt ? new Date(info.lastPredictionAt).toLocaleString() : 'None (No Data)'}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Live Priority Data Readiness Section */}
      <Card className="p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiDatabase className="text-emerald-500" /> Priority ML Retraining Readiness & Data Growth
          </h2>
          <Button onClick={handleCheckRetraining} variant="primary" size="sm" isLoading={checkLoading}>
            <FiShield className="mr-2" /> Check Retraining Readiness
          </Button>
        </div>

        {retrainingStatus ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Valid Records</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {retrainingStatus.recordsAvailable} <span className="text-sm font-normal text-slate-500">/ {retrainingStatus.requiredRecords}</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Distinct Weeks</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {retrainingStatus.weeksAvailable} <span className="text-sm font-normal text-slate-500">/ {retrainingStatus.requiredWeeks}</span>
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Valid Targets</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {retrainingStatus.validTargets} <span className="text-sm font-normal text-slate-500">/ {retrainingStatus.requiredTargets}</span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-sm text-amber-900 dark:text-amber-300">
              <p className="font-semibold flex items-center gap-2">
                <FiLock /> Retraining Status: {retrainingStatus.status}
              </p>
              <p className="mt-1 text-xs">{retrainingStatus.recommendation}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Loading retraining readiness status...</p>
        )}
      </Card>

      {/* Feature & Target Drift Notice */}
      <Card className="p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <FiTrendingUp className="text-indigo-500" /> Feature & Target Drift Status
        </h2>
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-slate-600 dark:text-slate-400">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Drift Status: INSUFFICIENT_DATA (No Production Data)
          </p>
          <p className="text-xs mt-1">
            Statistical Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) drift analysis require at least 100 completed production transactions before evaluation begins. Missing data is never classified as stable.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AIModelMonitoring;
