import { useState } from 'react';
import aiService from '../../services/ai.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { FiActivity, FiAlertCircle, FiCheckCircle, FiInfo, FiPieChart, FiShield } from 'react-icons/fi';

const FEATURE_IMPORTANCES = [
  { name: "pH Level (pH)", share: "39.69%" },
  { name: "Storage Temperature (°C)", share: "23.13%" },
  { name: "Fat Content (fat)", share: "9.25%" },
  { name: "Turbidity / Clarity (turbidity)", share: "9.07%" },
  { name: "Odor Rating (odor)", share: "7.70%" },
  { name: "Color Value (color)", share: "7.14%" },
  { name: "Taste Rating (taste)", share: "4.02%" }
];

const RiskPrediction = () => {
  const [ph, setPh] = useState('6.6');
  const [temperature, setTemperature] = useState('35');
  const [taste, setTaste] = useState('1');
  const [odor, setOdor] = useState('0');
  const [fat, setFat] = useState('1');
  const [turbidity, setTurbidity] = useState('0');
  const [color, setColor] = useState('254');
  const [category, setCategory] = useState('milk');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePredict = async () => {
    setSubmitting(true);
    try {
      const payload = {
        food_category: category,
        ph: ph !== '' ? Number(ph) : undefined,
        temperature: temperature !== '' ? Number(temperature) : undefined,
        taste: taste !== '' ? Number(taste) : undefined,
        odor: odor !== '' ? Number(odor) : undefined,
        fat: fat !== '' ? Number(fat) : undefined,
        turbidity: turbidity !== '' ? Number(turbidity) : undefined,
        color: color !== '' ? Number(color) : undefined
      };

      const res = await aiService.riskScore(payload);
      const data = res?.data || res || null;
      setResult(data);
      if (data?.insufficientData) {
        toast.error(data.message || 'Insufficient data for prediction');
      } else {
        toast.success('Milk quality evaluation complete!');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error?.message || 'Risk prediction failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isInsufficient = result?.insufficientData || !result?.riskLevel;
  const level = result?.riskLevel || 'UNKNOWN';

  const badgeVariant =
    level === 'HIGH_RISK'
      ? 'danger'
      : level === 'MEDIUM_RISK'
      ? 'warning'
      : 'success';

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Milk Quality Risk Prediction"
        subtitle="Evaluate milk freshness and quality risk using physical sensor measurements"
      />

      {/* Scope Disclaimer Card */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <FiInfo className="h-4 w-4 text-amber-700" />
          <span>Model Scope Limitation & Sensor Requirement</span>
        </div>
        <p>
          This model is trained specifically on public Milk Quality sensor data. It evaluates milk quality based on physical sensor readings (pH, Temperature, Taste, Odor, Fat, Turbidity, Color). It is <strong>strictly scoped to Milk &amp; Dairy products</strong> and cannot be applied to general food categories like rice, bread, or cooked meals.
        </p>
      </div>

      <Card title="Milk Quality Sensor Input Form" icon={<FiActivity className="h-5 w-5" />}>
        <div className="space-y-4 bg-[#FFF4E1]/40 p-4 rounded-2xl border border-[#89D7B7]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Food Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              >
                <option value="milk">Milk / Dairy</option>
                <option value="Rice Bowl">Rice Bowl (Non-Milk Test)</option>
                <option value="Cooked Meals">Cooked Meals (Non-Milk Test)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                pH Level (3.0 - 9.5)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 6.6"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Storage Temp (°C)
              </label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Fat Content
              </label>
              <select
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              >
                <option value="1">High (1)</option>
                <option value="0">Low (0)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Turbidity / Clarity
              </label>
              <select
                value={turbidity}
                onChange={(e) => setTurbidity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              >
                <option value="0">Low Turbidity (0)</option>
                <option value="1">High Turbidity (1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Odor Sensor
              </label>
              <select
                value={odor}
                onChange={(e) => setOdor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              >
                <option value="0">Good Odor (0)</option>
                <option value="1">Bad Odor (1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Taste Rating
              </label>
              <select
                value={taste}
                onChange={(e) => setTaste(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              >
                <option value="1">Optimal (1)</option>
                <option value="0">Off Taste (0)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Color Scale (240 - 255)
              </label>
              <input
                type="number"
                placeholder="e.g. 254"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handlePredict}
              loading={submitting}
              disabled={submitting}
              className="px-6 py-2.5"
            >
              Evaluate Quality Risk
            </Button>
          </div>
        </div>
      </Card>

      {!result ? (
        <EmptyState
          title="No Quality Assessment Run"
          description="Enter sensor readings above and click 'Evaluate Quality Risk' to test the trained Milk Quality Classifier."
        />
      ) : isInsufficient ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-3">
          <FiAlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold text-amber-900">Risk Prediction Unavailable</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            {result.message || 'Required sensor information is unavailable.'}
          </p>
          {result.missingFeatures && result.missingFeatures.length > 0 && (
            <div className="text-[11px] font-semibold text-amber-700 bg-amber-100/60 py-1.5 px-3 rounded-lg inline-block">
              Missing features: {result.missingFeatures.join(', ')}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card icon={<FiShield className="h-5 w-5" />} title="Assessed Milk Quality">
              <div className="text-center py-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block">Quality Classification</span>
                <div className="text-5xl font-extrabold text-[#428475] uppercase">
                  {result.prediction} Grade
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant={badgeVariant}>{result.riskLevel}</Badge>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 inline-block font-medium">
                  {result.uncertainty || "Prediction uncertainty is not calibrated."}
                </div>
              </div>
            </Card>

            <Card icon={<FiCheckCircle className="h-5 w-5" />} title="Model Transparency & Scope">
              <div className="p-4 space-y-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><span className="font-semibold">Model Name:</span> Milk Quality Risk Model</div>
                  <div><span className="font-semibold">Algorithm:</span> Random Forest Classifier</div>
                  <div><span className="font-semibold">Model Status:</span> <span className="font-mono text-amber-700 font-bold">{result.modelStatus || 'EXTERNAL_DATA_MODEL'}</span></div>
                  <div><span className="font-semibold">Model Version:</span> <span className="font-mono text-slate-800">{result.modelVersion || '1.0.0'}</span></div>
                  <div><span className="font-semibold">Test Accuracy:</span> <span className="font-mono text-emerald-700 font-bold">98.74%</span></div>
                  <div><span className="font-semibold">Test F1 Macro:</span> <span className="font-mono text-emerald-700 font-bold">0.9862</span></div>
                </div>
                <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-200">
                  Trained on public Milk Quality dataset (milknew.csv). Not trained on FoodBridge historical data. FoodBridge currently does not collect physical sensor readings.
                </p>
              </div>
            </Card>
          </div>

          <Card icon={<FiPieChart className="h-5 w-5" />} title="Sensor Feature Importance Breakdown">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs p-1">
              {FEATURE_IMPORTANCES.map((f) => (
                <div key={f.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700">{f.name}</span>
                  <span className="font-mono font-extrabold text-[#428475]">{f.share}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </section>
  );
};

export default RiskPrediction;
