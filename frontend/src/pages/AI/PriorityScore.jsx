import { useEffect, useState } from 'react';
import aiService from '../../services/ai.service';
import donationService from '../../services/donation.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiZap, FiAlertCircle } from 'react-icons/fi';

const PriorityScore = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [donations, setDonations] = useState([]);
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [demand, setDemand] = useState('');
  const [capacity, setCapacity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const dRes = await donationService.listDonations({ limit: 100 });
        if (!mounted) return;
        const arr = Array.isArray(dRes) ? dRes : Array.isArray(dRes?.data) ? dRes.data : [];
        setDonations(arr);
        if (arr.length > 0) setSelectedDonationId(arr[0]._id || arr[0].id || '');
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleScore = async () => {
    if (!selectedDonationId) return toast.error('Select a donation first');
    setSubmitting(true);
    try {
      const donation = donations.find((d) => (d._id || d.id) === selectedDonationId);
      const payload = {
        donationId: selectedDonationId,
        donation,
        distance_km: distanceKm !== '' ? Number(distanceKm) : undefined,
        demand: demand !== '' ? Number(demand) : undefined,
        ngo_capacity: capacity !== '' ? Number(capacity) : undefined
      };
      const res = await aiService.priorityScore(payload);
      const data = res?.data || res || null;
      setResult(data);
      if (data?.insufficientData) {
        toast.error(data.message || 'Insufficient data for priority scoring');
      } else {
        toast.success('Priority score calculated!');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error?.message || 'Priority scoring failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;

  const isInsufficient = result?.insufficientData || result?.score === null || result?.score === undefined;
  const rawScore = result?.score ?? 0;
  const score = Math.round(rawScore > 1 ? rawScore : rawScore * 100);

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Donation Priority Score"
        subtitle="Algorithmic urgency ranking based on perishability, quantity, and demand"
      />

      <Card title="Calculate Priority Ranking" icon={<FiZap className="h-5 w-5" />}>
        <div className="space-y-4 bg-[#FFF4E1]/40 p-4 rounded-2xl border border-[#89D7B7]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Food Donation Item
              </label>
              <select
                value={selectedDonationId}
                onChange={(e) => setSelectedDonationId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              >
                <option value="">Select donation...</option>
                {donations.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.foodName || d.name || d.title || `${d.quantity || ''} ${d.unit || ''}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                placeholder="e.g. 5.0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Regional Demand
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                NGO Capacity
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleScore}
              loading={submitting}
              disabled={submitting || !selectedDonationId}
              className="px-6 py-2.5"
            >
              Calculate Priority
            </Button>
          </div>
        </div>
      </Card>

      {!result ? (
        <EmptyState
          title="No Priority Score Calculated"
          description="Select a donation and enter dispatch details to calculate urgency scores."
        />
      ) : isInsufficient ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-3">
          <FiAlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold text-amber-900">Insufficient Data for Priority Scoring</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            {result.message || 'Required features (distance, demand, or NGO capacity) are missing.'}
          </p>
          {result.missingFeatures && (
            <div className="text-[11px] font-semibold text-amber-700">
              Missing required fields: {result.missingFeatures.join(', ')}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card icon={<FiTrendingUp className="h-5 w-5" />} title="Priority Rating">
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-[#89D7B7]/25 text-[#1A312C] border-4 border-[#428475] shadow-md">
                <span className="text-4xl font-extrabold">{score}</span>
              </div>
              <div className="flex justify-center">
                <Badge variant={score > 75 ? 'danger' : score > 50 ? 'warning' : 'success'}>
                  {score > 75 ? 'HIGH PRIORITY — URGENT' : score > 50 ? 'MEDIUM PRIORITY' : 'LOW PRIORITY'}
                </Badge>
              </div>
              <div className="h-3 w-full rounded-full bg-[#FFF4E1] border border-[#89D7B7] overflow-hidden">
                <div className="h-full rounded-full bg-[#428475] transition-all duration-500" style={{ width: `${score}%` }} />
              </div>
            </div>
          </Card>

          <Card title="Priority Factors & Information">
            <div className="space-y-3 text-xs font-medium text-[#1A312C]">
              {result.explanation ? (
                <div className="p-3 rounded-xl bg-[#FFF4E1]/50 border border-[#89D7B7]">
                  <strong className="block text-slate-700">Explanation:</strong>
                  {result.explanation}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#FFF4E1]/50 border border-[#89D7B7] text-slate-600">
                  Priority computed based on perishability, quantity, distance, regional demand, and NGO capacity.
                </div>
              )}
              {result.modelStatus && (
                <div className="text-[10px] text-slate-500 font-mono pt-2">
                  Model Status: {result.modelStatus}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </section>
  );
};

export default PriorityScore;
