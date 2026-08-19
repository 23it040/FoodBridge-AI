import { useEffect, useState, useCallback } from 'react';
import aiService from '../../services/ai.service';
import { normalizeObjectResponse } from '../../utils/normalizeApiResponse';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiDatabase, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock, FiCpu, FiLayers, FiShield, FiTrendingUp, FiAward } from 'react-icons/fi';

const AIDataReadiness = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [modelStatus, setModelStatus] = useState([]);
  const [priorityReadiness, setPriorityReadiness] = useState({});
  const [demandReadiness, setDemandReadiness] = useState({});
  const [riskReadiness, setRiskReadiness] = useState({});
  const [monitoring, setMonitoring] = useState({});

  const loadDataReadiness = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [statusRes, pRes, dRes, rRes, mRes, capRes, qRes, retrainRes] = await Promise.all([
        aiService.getModelStatus(),
        aiService.getPriorityDataReadiness(),
        aiService.getDemandDataReadiness(),
        aiService.getRiskDataReadiness(),
        aiService.getModelMonitoring(),
        aiService.getCapabilities(),
        aiService.getDataQuality(),
        aiService.checkRetrainReadiness()
      ]);

      const statusData = normalizeObjectResponse(statusRes);
      setModelStatus(statusData.models || []);

      setPriorityReadiness(normalizeObjectResponse(pRes));
      setDemandReadiness(normalizeObjectResponse(dRes));
      setRiskReadiness(normalizeObjectResponse(rRes));
      setMonitoring(normalizeObjectResponse(mRes));
    } catch (err) {
      console.error('Failed to load AI data readiness:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to audit AI data readiness from database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDataReadiness();
  }, [loadDataReadiness]);

  const pData = priorityReadiness || {};
  const dData = demandReadiness || {};
  const rData = riskReadiness || {};
  const mData = monitoring || {};
  const ops = mData.operational || {};

  return (
    <section className="space-y-6 py-6">
      <PageHeader
        title="AI Data Readiness & Governance Audit"
        subtitle="Real-time audit of FoodBridge MongoDB record volume, retraining thresholds, and model statuses"
        actions={
          <Button onClick={() => loadDataReadiness(true)} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data Audit</span>
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size={48} />
          <p className="text-xs font-semibold text-slate-500">Auditing MongoDB collection records for AI data readiness...</p>
        </div>
      ) : error ? (
        <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
          <div className="flex justify-center text-red-500">
            <FiAlertCircle className="h-10 w-10" />
          </div>
          <div>
            <h4 className="font-extrabold text-red-800 text-sm">Unable to complete AI data readiness audit</h4>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={() => loadDataReadiness()} className="mx-auto text-xs px-5 py-2">
            Retry Audit
          </Button>
        </div>
      ) : (
        <>
          {/* Top Level Operational Record Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Food Donations" value={ops.totalDonations ?? 0} icon={<FiDatabase className="h-6 w-6" />} />
            <StatCard label="Total Food Requests" value={ops.totalRequests ?? 0} icon={<FiLayers className="h-6 w-6" />} />
            <StatCard label="Completed Pickups" value={ops.completedPickups ?? 0} icon={<FiCheckCircle className="h-6 w-6" />} />
            <StatCard label="Lifecycle Events Logged" value={ops.totalLifecycleEvents ?? 0} icon={<FiClock className="h-6 w-6" />} />
          </div>

          {/* Model Status Governance Cards */}
          <Card icon={<FiCpu className="h-5 w-5" />} title="Central AI Model Registry Status">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modelStatus.map((m) => (
                <div key={m.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-[#1A312C] text-sm">{m.name}</h4>
                    <Badge variant={m.status === 'INSUFFICIENT_DATA' ? 'warning' : m.status.includes('LIVE') ? 'success' : 'default'}>
                      {m.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-slate-600 text-[11px] pt-2 border-t border-slate-200">
                    <div><span className="font-semibold">Version:</span> {m.version}</div>
                    <div><span className="font-semibold">Data Source:</span> {m.dataSource}</div>
                    <div><span className="font-semibold">FoodBridge-Trained:</span> {m.foodBridgeTrained ? 'True' : 'False'}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Data Readiness Sections */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Priority Model Readiness Card */}
            <Card icon={<FiAward className="h-5 w-5" />} title="Donation Priority Model Readiness">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Model Status:</span>
                  <Badge variant={pData.status === 'INSUFFICIENT_DATA' ? 'warning' : 'success'}>{pData.status || 'INSUFFICIENT_DATA'}</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Records Available:</span>
                  <span className="font-extrabold text-[#1A312C]">{pData.recordsAvailable ?? 0} / {pData.minimumRecordsRequired ?? 500}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Weeks Collected:</span>
                  <span className="font-extrabold text-[#1A312C]">{pData.weeksAvailable ?? 0} / {pData.minimumWeeksRequired ?? 12}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Valid Operational Target:</span>
                  <span className="font-bold text-amber-700">{pData.validTargetAvailable ? 'Available' : 'Unavailable (Needs >= 500 pickups)'}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 font-semibold">Retraining Status:</span>
                  <span className={`font-extrabold ${pData.readyForTraining ? 'text-green-700' : 'text-amber-700'}`}>
                    {pData.readyForTraining ? 'READY FOR TRAINING' : 'NOT READY'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">{pData.message}</p>
              </div>
            </Card>

            {/* Demand Model Readiness Card */}
            <Card icon={<FiTrendingUp className="h-5 w-5" />} title="Demand Model Readiness">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Model Status:</span>
                  <Badge variant="default">{dData.status || 'EXTERNAL_DATA_MODEL'}</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Current Dataset Source:</span>
                  <span className="font-bold text-[#1A312C]">{dData.currentModelSource || 'Kaggle Food Demand Forecasting'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">FoodBridge Records Collected:</span>
                  <span className="font-extrabold text-[#1A312C]">{dData.recordsAvailable ?? 0} / {dData.minimumRecordsRequired ?? 500}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">FoodBridge-Trained:</span>
                  <span className="font-bold text-slate-700">{dData.foodBridgeTrained ? 'True' : 'False'}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 font-semibold">Retraining Status:</span>
                  <span className={`font-extrabold ${dData.retrainingReady ? 'text-green-700' : 'text-amber-700'}`}>
                    {dData.retrainingReady ? 'READY FOR RETRAINING' : 'EXTERNAL MODEL IN USE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">{dData.message}</p>
              </div>
            </Card>

            {/* Risk Model Readiness Card */}
            <Card icon={<FiShield className="h-5 w-5" />} title="Food Quality Risk Readiness">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Model Status:</span>
                  <Badge variant="default">{rData.status || 'EXTERNAL_DATA_MODEL'}</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Current Dataset Source:</span>
                  <span className="font-bold text-[#1A312C]">{rData.currentModelSource || 'Public Milk Quality Dataset'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Model Scope:</span>
                  <span className="font-bold text-[#428475]">{rData.scope || 'Milk quality classification'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">Physical Sensor Data Collected:</span>
                  <span className="font-bold text-amber-700">0 (Sensor hardware not integrated)</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 font-semibold">FoodBridge-Trained:</span>
                  <span className="font-bold text-slate-700">{rData.foodBridgeTrained ? 'True' : 'False'}</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">{rData.message}</p>
              </div>
            </Card>
          </div>
        </>
      )}
    </section>
  );
};

export default AIDataReadiness;
