import { useEffect, useState } from 'react';
import aiService from '../../services/ai.service';
import donationService from '../../services/donation.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiMapPin, FiInfo, FiAlertCircle, FiCheckCircle, FiPieChart, FiActivity } from 'react-icons/fi';

const CATEGORIES = [
  "Rice Bowl", "Beverages", "Pasta", "Sandwich", "Pizza", "Starters",
  "Biryani", "Desert", "Salad", "Soup", "Seafood", "Fish", "Extras", "Other Snacks"
];

const CENTER_TYPES = [
  { label: "Community Center (TYPE_A)", value: "TYPE_A" },
  { label: "Regional Food Hub (TYPE_B)", value: "TYPE_B" },
  { label: "Local Shelter (TYPE_C)", value: "TYPE_C" }
];

const FEATURE_IMPORTANCES = [
  { name: "Previous Week Demand (lag_1)", share: "62.56%" },
  { name: "Rolling Demand Average (rolling_3_mean)", share: "19.85%" },
  { name: "Calendar Week (week)", share: "11.73%" },
  { name: "Food Category (category)", share: "4.77%" },
  { name: "Coverage Area (op_area)", share: "0.98%" },
  { name: "Center Profile (center_type)", share: "0.11%" }
];

const DemandPrediction = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [category, setCategory] = useState('Rice Bowl');
  const [centerType, setCenterType] = useState('TYPE_A');
  const [opArea, setOpArea] = useState('5.0');
  const [previousDonations, setPreviousDonations] = useState('150');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const dRes = await donationService.listDonations({ limit: 200 });
        if (!mounted) return;
        const arr = Array.isArray(dRes) ? dRes : Array.isArray(dRes?.data) ? dRes.data : [];
        const locs = arr.map((d) => d.location?.city || d.location?.name || d.city || d.pickupAddress).filter(Boolean);
        const uniq = Array.from(new Set(locs)).slice(0, 50);
        setLocations(uniq.length > 0 ? uniq : ['Central Metro Hub', 'East Zone Shelter', 'North Community Kitchen']);
        setSelectedLocation(uniq[0] || 'Central Metro Hub');
      } catch (error) {
        console.error(error);
        setLocations(['Central Metro Hub', 'East Zone Shelter', 'North Community Kitchen']);
        setSelectedLocation('Central Metro Hub');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handlePredict = async () => {
    if (!selectedLocation) return toast.error('Select a location first');
    if (!category) return toast.error('Select a food category');
    if (!previousDonations || Number(previousDonations) < 0) return toast.error('Enter valid historical demand meals');

    setSubmitting(true);
    try {
      const payload = {
        city: selectedLocation,
        food_category: category,
        center_type: centerType,
        op_area: Number(opArea) || 5.0,
        previous_donations: Number(previousDonations)
      };

      const res = await aiService.predictDemand(payload);
      const data = res?.data || res || null;
      setResult(data);
      if (data?.insufficientData) {
        toast.error(data.message || 'Insufficient data for demand prediction');
      } else {
        toast.success('Food demand forecast updated!');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error?.message || 'Demand prediction failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;

  const isInsufficient = result?.insufficientData || (result?.prediction === null && result?.expected_meals === null);

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Food Demand Prediction"
        subtitle="Forecast regional meal distribution requirements using transparent public machine learning models"
      />

      <Card title="Regional Demand Predictor" icon={<FiMapPin className="h-5 w-5" />}>
        <div className="space-y-4 bg-[#FFF4E1]/40 p-4 rounded-2xl border border-[#89D7B7]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                City / Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              >
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Food Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Center Profile
              </label>
              <select
                value={centerType}
                onChange={(e) => setCenterType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              >
                {CENTER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Recent Daily Demand (Meals)
              </label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={previousDonations}
                onChange={(e) => setPreviousDonations(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handlePredict}
              loading={submitting}
              disabled={submitting || !selectedLocation}
              className="px-6 py-2.5"
            >
              Forecast Demand
            </Button>
          </div>
        </div>
      </Card>

      {!result ? (
        <EmptyState
          title="No Forecast Generated"
          description="Configure your parameters above and click 'Forecast Demand' to run inference against the trained ML model."
        />
      ) : isInsufficient ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-3">
          <FiAlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold text-amber-900">Reliable demand prediction is currently unavailable</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            {result.message || 'Insufficient real FoodBridge historical demand data.'}
          </p>
          {result.missingFeatures && result.missingFeatures.length > 0 && (
            <div className="text-[11px] font-semibold text-amber-700 bg-amber-100/60 py-1.5 px-3 rounded-lg inline-block">
              Missing required features: {result.missingFeatures.join(', ')}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card icon={<FiTrendingUp className="h-5 w-5" />} title="Predicted Meal Requirement">
              <div className="text-center py-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block">Expected Meals Needed</span>
                <div className="text-6xl font-extrabold text-[#428475]">
                  {Math.round(result.prediction ?? result.expected_meals)}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="bg-[#89D7B7]/25 text-[#1A312C] px-3 py-1 rounded-full border border-[#89D7B7]">
                    Category: {category}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    Location: {selectedLocation}
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 inline-block font-medium">
                  {result.uncertainty || "Prediction uncertainty is not calibrated."}
                </div>
              </div>
            </Card>

            <Card icon={<FiInfo className="h-5 w-5" />} title="Model Transparency & Provenance">
              <div className="p-4 space-y-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#1A312C]">
                  <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Initial model trained on public Kaggle Food Demand Forecasting dataset.</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200">
                  <div><span className="font-semibold">Model Status:</span> <span className="font-mono text-amber-700 font-bold">{result.modelStatus || 'EXTERNAL_DATA_MODEL'}</span></div>
                  <div><span className="font-semibold">Model Version:</span> <span className="font-mono text-slate-800">{result.modelVersion || '1.0.0'}</span></div>
                  <div><span className="font-semibold">Data Source:</span> {result.dataSource || 'Kaggle Food Demand Forecasting'}</div>
                  <div><span className="font-semibold">FoodBridge Retrained:</span> {result.foodBridgeTrained ? 'True' : 'False (Public Data Baseline)'}</div>
                </div>
                <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                  Not trained on FoodBridge historical data. A FoodBridge-specific model will be retrained when &ge;500 transaction records across &ge;12 weeks accumulate.
                </p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card icon={<FiActivity className="h-5 w-5" />} title="Measured Evaluation Metrics & Baseline">
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center p-2 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Gradient Boosting R²</span>
                    <span className="text-base font-extrabold text-emerald-700">0.5874</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Naive Baseline R²</span>
                    <span className="text-base font-extrabold text-slate-600">0.4363</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Gradient Boosting WAPE</span>
                    <span className="text-base font-extrabold text-emerald-700">38.22%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Naive Baseline WAPE</span>
                    <span className="text-base font-extrabold text-slate-600">40.22%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Detailed Test Metrics (Held-out Test Set):</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                    <div>MAE: <span className="font-mono font-semibold">92.15</span></div>
                    <div>RMSE: <span className="font-mono font-semibold">224.95</span></div>
                    <div>sMAPE: <span className="font-mono font-semibold">45.37%</span></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card icon={<FiPieChart className="h-5 w-5" />} title="Model Feature Importance">
              <div className="space-y-2 p-1 text-xs">
                {FEATURE_IMPORTANCES.map((f) => (
                  <div key={f.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">{f.name}</span>
                    <span className="font-mono font-extrabold text-[#428475]">{f.share}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
};

export default DemandPrediction;
