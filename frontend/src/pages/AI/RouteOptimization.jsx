import { useEffect, useState } from 'react';
import aiService from '../../services/ai.service';
import donationService from '../../services/donation.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import LeafletMap from '../../components/maps/LeafletMap';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { FiNavigation, FiMap, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';

const RouteOptimization = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [accepted, setAccepted] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const dRes = await donationService.listDonations({ limit: 200 });
        if (!mounted) return;
        const arr = Array.isArray(dRes) ? dRes : Array.isArray(dRes?.data) ? dRes.data : [];
        setAccepted(arr);
        if (arr.length > 0) {
          setSelectedIds(arr.slice(0, 3).map((d) => d._id || d.id));
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleOptimize = async () => {
    if (!selectedIds.length) return toast.error('Select at least one pickup location');
    setSubmitting(true);
    try {
      const selectedDonations = accepted.filter((d) => selectedIds.includes(d._id || d.id));
      const firstDonation = selectedDonations[0];
      const startLat = firstDonation?.latitude || firstDonation?.location?.latitude;
      const startLng = firstDonation?.longitude || firstDonation?.location?.longitude;

      const payload = {
        start: (startLat && startLng) ? { latitude: Number(startLat), longitude: Number(startLng) } : undefined,
        donations: selectedDonations
      };
      const res = await aiService.optimizeRoute(payload);
      const data = res?.data || res || null;
      setResult(data);
      if (data?.insufficientData) {
        toast.error(data.message || 'Valid coordinates are required for route optimization.');
      } else {
        toast.success('Route optimized successfully!');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error?.message || 'Route optimization failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;

  const isInsufficient = result?.insufficientData || result?.total_distance_km === null || result?.total_distance_km === undefined;
  const stops = result?.stops || [];
  const polylinePoints = stops
    .filter((s) => s.lat !== undefined && s.lng !== undefined)
    .map((s) => [s.lat, s.lng]);

  const markers = stops
    .filter((s) => s.lat !== undefined && s.lng !== undefined)
    .map((s, idx) => ({
      id: s.id || `stop-${idx}`,
      type: idx === stops.length - 1 ? 'ngo' : 'donation',
      foodName: s.name || `Stop #${idx + 1}`,
      position: [s.lat, s.lng],
      popupHtml: `
        <div style="font-family: system-ui; padding: 4px;">
          <div style="font-weight: 800; color: #1E293B; font-size: 14px;">Stop #${idx + 1}: ${s.name || 'Pickup Point'}</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${s.address || 'Location'}</div>
        </div>
      `
    }));

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Smart Route Optimization"
        subtitle="AI-driven multi-stop pickup and delivery route planning"
      />

      <Card title="Select Pickup Locations" icon={<FiCheckSquare className="h-5 w-5" />}>
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-500">
            Select food donation pickup points to generate an optimized fuel-efficient route:
          </p>
          <div className="max-h-56 overflow-y-auto rounded-2xl border border-[#89D7B7] bg-[#FFF4E1]/30 p-3 space-y-2">
            {accepted.length === 0 && <div className="text-xs text-slate-500 py-4 text-center">No pickup locations available.</div>}
            {accepted.map((d) => {
              const id = d._id || d.id;
              const isChecked = selectedIds.includes(id);
              return (
                <label key={id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked ? 'border-[#428475] bg-white shadow-xs' : 'border-slate-200 bg-white/60 hover:bg-white'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds((s) => [...s, id]);
                        else setSelectedIds((s) => s.filter((x) => x !== id));
                      }}
                      className="h-4 w-4 rounded-md accent-[#428475]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#1A312C]">{d.foodName || d.name || d.title || 'Food Donation'}</div>
                      <div className="text-[11px] text-slate-500">{d.pickupAddress || 'Address N/A'}</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#428475]">{d.quantity} {d.unit || 'units'}</div>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleOptimize}
              loading={submitting}
              disabled={submitting || selectedIds.length === 0}
              className="px-6 py-2.5"
            >
              Optimize Pickup Route
            </Button>
          </div>
        </div>
      </Card>

      {!result ? (
        <EmptyState
          title="No Optimized Route Generated"
          description="Select pickup items above and click 'Optimize Pickup Route' to view map and itinerary."
        />
      ) : isInsufficient ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-3">
          <FiAlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
          <h3 className="text-lg font-bold text-amber-900">Insufficient Data for Route Optimization</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            {result.message || 'Valid latitude and longitude coordinates are required for route optimization.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card title="Interactive Route Map" icon={<FiMap className="h-5 w-5" />}>
              <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
                <LeafletMap key={`route-opt-map-${markers.length}`} markers={markers} polylinePoints={polylinePoints} />
              </div>
            </Card>
          </div>
          <div>
            <Card title="Optimized Itinerary" icon={<FiNavigation className="h-5 w-5" />}>
              <div className="space-y-4 text-xs font-medium text-[#1A312C]">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-slate-500 block">Total Distance</span>
                    <span className="font-extrabold text-[#428475] text-sm">
                      {result.total_distance_km} km
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFF4E1] border border-[#89D7B7]">
                    <span className="text-slate-500 block">Estimated Time</span>
                    <span className="font-extrabold text-[#1A312C] text-sm">
                      {result.estimated_time_minutes} mins
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-700 block mb-2">Sequential Stop Order:</span>
                  <ol className="space-y-2">
                    {stops.map((s, i) => (
                      <li key={s.id || i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#428475] text-white font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{s.name || s.address || `Stop #${i + 1}`}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
};

export default RouteOptimization;
