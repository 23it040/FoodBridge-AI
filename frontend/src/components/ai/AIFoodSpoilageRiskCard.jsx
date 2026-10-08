import { useState, useEffect, useCallback } from 'react';
import donationService from '../../services/donation.service';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiInfo,
  FiRefreshCw,
  FiShield,
  FiThermometer
} from 'react-icons/fi';

const AIFoodSpoilageRiskCard = ({
  donationId,
  donation,
  className = ''
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState('pantry');

  const fetchSpoilageRisk = useCallback(async (storageOverride = null) => {
    if (!donationId && !donation?._id && !donation?.id) {
      setError('Donation ID is required to calculate spoilage risk.');
      setLoading(false);
      return;
    }

    const id = donationId || donation?._id || donation?.id;
    if (storageOverride) {
      setEvaluating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const activeStorage = storageOverride || selectedStorage;
      let res;
      if (storageOverride) {
        res = await donationService.evaluateSpoilageRisk(id, {
          storageCondition: activeStorage
        });
      } else {
        res = await donationService.getSpoilageRisk(id, {
          storageCondition: activeStorage
        });
      }

      const riskData = res?.data || res;
      setData(riskData);
      if (riskData?.featuresUsed?.storageCondition) {
        setSelectedStorage(riskData.featuresUsed.storageCondition);
      }
    } catch (err) {
      console.warn('Spoilage risk API fetch failed:', err);
      const msg = err?.response?.data?.message || err?.message || 'Unable to connect to AI spoilage prediction service.';
      setError(msg);
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  }, [donationId, donation, selectedStorage]);

  useEffect(() => {
    fetchSpoilageRisk();
  }, [donationId, donation?._id, donation?.id]);

  const handleStorageChange = (condition) => {
    setSelectedStorage(condition);
    fetchSpoilageRisk(condition);
  };

  // Determine Level, Color, and Progress
  const riskScore = data?.riskScore != null ? Number(data.riskScore) : (data?.spoilageRisk === 1 ? 85 : 20);
  const rawLevel = String(data?.riskLevel || (riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low')).toUpperCase();

  const getRiskConfig = () => {
    if (rawLevel === 'CRITICAL' || rawLevel === 'HIGH' || riskScore >= 70) {
      return {
        badgeVariant: 'danger',
        label: rawLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        textClass: 'text-red-700',
        bgClass: 'bg-red-500',
        meterBg: 'bg-red-100',
        ringColor: '#DC2626',
        icon: <FiAlertTriangle className="h-5 w-5 text-red-600" />
      };
    }
    if (rawLevel === 'MEDIUM' || riskScore >= 40) {
      return {
        badgeVariant: 'warning',
        label: 'MEDIUM',
        textClass: 'text-amber-800',
        bgClass: 'bg-amber-500',
        meterBg: 'bg-amber-100',
        ringColor: '#D97706',
        icon: <FiClock className="h-5 w-5 text-amber-600" />
      };
    }
    return {
      badgeVariant: 'success',
      label: 'LOW',
      textClass: 'text-[#2F8F72]',
      bgClass: 'bg-[#2F8F72]',
      meterBg: 'bg-[#E8F6F0]',
      ringColor: '#2F8F72',
      icon: <FiCheckCircle className="h-5 w-5 text-[#2F8F72]" />
    };
  };

  const riskConfig = getRiskConfig();

  // LOADING STATE
  if (loading) {
    return (
      <div className={`rounded-3xl border border-[#79D6B2]/40 bg-white/90 backdrop-blur-md p-6 shadow-sm ${className}`}>
        <div className="flex items-center justify-between border-b border-[#79D6B2]/20 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F6F0] text-[#2F8F72]">
              <FiActivity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#102A2A]">AI Food Spoilage Risk</h3>
              <p className="text-[11px] text-slate-500 font-medium">Analyzing food shelf-life parameters...</p>
            </div>
          </div>
          <Badge variant="default" className="text-[10px]">Processing</Badge>
        </div>

        <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
          <Spinner size={32} />
          <p className="text-xs font-semibold text-[#102A2A]">Calculating spoilage risk via USDA FoodKeeper ML model...</p>
          <p className="text-[11px] text-slate-400">Evaluating perishability, temperature, and storage parameters</p>
        </div>
      </div>
    );
  }

  // ERROR STATE (Complete failure to reach backend or critical failure)
  if (error && !data) {
    return (
      <div className={`rounded-3xl border border-red-200 bg-red-50/90 backdrop-blur-md p-6 shadow-sm ${className}`}>
        <div className="flex items-center justify-between border-b border-red-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FiAlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-[#102A2A]">AI Food Spoilage Risk</h3>
          </div>
          <Badge variant="danger" className="text-[10px]">Error</Badge>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center space-y-3">
          <FiInfo className="h-6 w-6 text-amber-600 mx-auto" />
          <p className="text-xs font-bold text-amber-900">AI prediction temporarily unavailable.</p>
          <p className="text-[11px] text-slate-600">{error}</p>
          <Button
            size="sm"
            onClick={() => fetchSpoilageRisk()}
            className="text-xs gap-1.5 mx-auto bg-[#2F8F72] hover:bg-[#102A2A] text-white"
          >
            <FiRefreshCw className="h-3.5 w-3.5" />
            Retry Prediction
          </Button>
        </div>
      </div>
    );
  }

  const isModelUnavailable = data?.aiAvailable === false || data?.fallback === true;
  const confidencePercent = data?.confidence != null ? Math.round(Number(data.confidence) * 100) : null;
  const hoursLeft = data?.hoursUntilExpiry != null ? data.hoursUntilExpiry : null;

  return (
    <div className={`rounded-3xl border border-[#79D6B2]/40 bg-white/95 backdrop-blur-md p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#79D6B2]/20 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F6F0] text-[#2F8F72] border border-[#79D6B2]/40 shadow-xs">
            <FiCpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#102A2A]">AI Food Spoilage Risk</h3>
              <Badge variant={riskConfig.badgeVariant} className="text-[10px]">
                {riskConfig.label} RISK
              </Badge>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              {isModelUnavailable ? 'Safety Heuristic Engine' : 'Trained on USDA FoodKeeper Dataset'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {evaluating && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2F8F72]">
              <Spinner size={14} /> Recalculating...
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchSpoilageRisk()}
            disabled={evaluating}
            className="h-8 w-8 p-0 rounded-xl hover:bg-[#E8F6F0] text-[#2F8F72]"
            title="Refresh prediction"
          >
            <FiRefreshCw className={`h-4 w-4 ${evaluating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Model Offline / Fallback Notice */}
      {isModelUnavailable && (
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
          <FiAlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">AI prediction temporarily unavailable.</p>
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
              Live AI inference microservice is currently offline or unreachable. Displaying safety estimation based on verified food shelf-life guidelines.
            </p>
          </div>
        </div>
      )}

      {/* Main Metric & Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Risk Percentage Gauge */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#79D6B2]/30 bg-[#E8F6F0]/60 p-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Spoilage Probability</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black tracking-tight ${riskConfig.textClass}`}>
              {riskScore.toFixed(1)}%
            </span>
          </div>

          <div className="w-full mt-3">
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${riskConfig.bgClass}`}
                style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
              <span>0% Low</span>
              <span>50% Mid</span>
              <span>100% High</span>
            </div>
          </div>
        </div>

        {/* Risk Tier & Shelf Window */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#79D6B2]/30 bg-white p-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Risk Evaluation</span>
            <div className="flex items-center gap-2">
              {riskConfig.icon}
              <span className={`text-xl font-extrabold ${riskConfig.textClass}`}>
                {riskConfig.label} RISK
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {rawLevel === 'HIGH' || rawLevel === 'CRITICAL'
                ? 'High decay probability. Immediate consumption or cold chain advised.'
                : 'Safe shelf life. Compatible with normal redistribution timeline.'}
            </p>
          </div>

          {hoursLeft !== null && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold text-[11px]">Time to Expiry:</span>
              <span className={`font-black ${hoursLeft <= 6 ? 'text-red-600' : 'text-[#102A2A]'}`}>
                {hoursLeft <= 0 ? 'Expired' : `${hoursLeft} hours`}
              </span>
            </div>
          )}
        </div>

        {/* Model Status & Confidence */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#79D6B2]/30 bg-white p-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Model Diagnostics</span>
            <div className="flex items-center gap-1.5">
              <FiShield className="h-4 w-4 text-[#2F8F72]" />
              <span className="text-xs font-bold text-[#102A2A]">
                {isModelUnavailable ? 'Rule-Based Fallback' : 'RandomForest v1.0.0'}
              </span>
            </div>
            {confidencePercent && (
              <div className="mt-2">
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-500">Confidence</span>
                  <span className="text-[#2F8F72]">{confidencePercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#2F8F72]" style={{ width: `${confidencePercent}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Status:</span>
            <span className={`font-bold ${isModelUnavailable ? 'text-amber-700' : 'text-emerald-700'}`}>
              {isModelUnavailable ? '● Offline (Protected)' : '● Active & Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Contributing Factors */}
      <div className="mb-5 rounded-2xl border border-[#79D6B2]/20 bg-[#E8F6F0]/30 p-4">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#102A2A] mb-3 flex items-center gap-1.5">
          <FiInfo className="h-3.5 w-3.5 text-[#2F8F72]" />
          Key Contributing Spoilage Factors
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-white p-2.5 border border-slate-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
            <span className="font-bold text-[#102A2A] line-clamp-1">{data?.featuresUsed?.category || donation?.category || 'Cooked Meals'}</span>
          </div>

          <div className="rounded-xl bg-white p-2.5 border border-slate-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Storage Temp</span>
            <span className="font-bold text-[#102A2A] flex items-center gap-1">
              <FiThermometer className="h-3.5 w-3.5 text-[#2F8F72]" />
              {data?.featuresUsed?.storageTemperatureC != null ? `${data.featuresUsed.storageTemperatureC}°C` : '22°C'}
            </span>
          </div>

          <div className="rounded-xl bg-white p-2.5 border border-slate-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Packaging</span>
            <span className="font-bold text-[#102A2A]">
              {data?.featuresUsed?.isOpened === 1 ? 'Opened / Prepared' : 'Sealed / Original'}
            </span>
          </div>

          <div className="rounded-xl bg-white p-2.5 border border-slate-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Cold Chain</span>
            <span className={`font-bold ${data?.featuresUsed?.requiresRefrigeration === 1 ? 'text-red-700' : 'text-[#2F8F72]'}`}>
              {data?.featuresUsed?.requiresRefrigeration === 1 ? 'Mandatory' : 'Room Temp OK'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Storage Simulator */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-[#79D6B2]/30 bg-white">
        <div className="flex items-center gap-2">
          <FiThermometer className="h-4 w-4 text-[#2F8F72]" />
          <span className="text-xs font-bold text-[#102A2A]">Simulate Storage Condition:</span>
        </div>

        <div className="flex gap-1.5">
          {[
            { id: 'pantry', label: 'Pantry (22°C)' },
            { id: 'refrigerated', label: 'Fridge (4°C)' },
            { id: 'frozen', label: 'Freezer (-18°C)' }
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStorageChange(s.id)}
              disabled={evaluating}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStorage === s.id
                  ? 'bg-[#2F8F72] text-white shadow-xs'
                  : 'bg-[#E8F6F0] text-[#102A2A] hover:bg-[#79D6B2]/30'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="rounded-2xl border border-[#79D6B2]/40 bg-gradient-to-r from-[#E8F6F0] to-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2F8F72] text-white shrink-0 shadow-xs">
            <FiActivity className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#102A2A]">AI Action Recommendation</h5>
            <p className="text-xs text-[#102A2A] font-semibold leading-relaxed">
              {data?.recommendation || 'Evaluate immediate pickup urgency to prevent surplus food decay.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFoodSpoilageRiskCard;
