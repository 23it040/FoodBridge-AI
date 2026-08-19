import { useEffect, useState } from 'react';
import aiService from '../../services/ai.service';
import donationService from '../../services/donation.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LeafletMap from '../../components/maps/LeafletMap';
import { FiCpu, FiMapPin, FiAward, FiCheckCircle, FiAlertTriangle, FiNavigation, FiExternalLink, FiAlertCircle } from 'react-icons/fi';

const Recommendation = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [warningMessage, setWarningMessage] = useState(null);
  const [insufficientMsg, setInsufficientMsg] = useState(null);
  const [donations, setDonations] = useState([]);
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [selectedNgo, setSelectedNgo] = useState(null);
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
        toast.error('Failed to load donations');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleRecommend = async () => {
    if (!selectedDonationId) return toast.error('Select a donation first');
    setSubmitting(true);
    setWarningMessage(null);
    setInsufficientMsg(null);
    setSelectedNgo(null);
    try {
      const donation = donations.find((d) => (d._id || d.id) === selectedDonationId);
      if (!donation) return toast.error('Donation not found');

      const payload = { donationId: selectedDonationId, donation };
      const res = await aiService.recommend(payload);

      const raw = res?.data || res || {};
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.recommendations)
        ? raw.recommendations
        : [];

      setRecommendations(list);
      if (raw.warning) setWarningMessage(raw.warning);
      if (raw.insufficientData) {
        setInsufficientMsg(raw.message || 'Valid donation coordinates are required for NGO recommendation.');
      } else if (list.length === 0) {
        setInsufficientMsg(raw.message || 'No verified nearby NGOs found.');
      } else {
        setSelectedNgo(list[0]);
        toast.success('AI Matching completed!');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error?.message || 'Recommendation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const currentDonation = donations.find((d) => (d._id || d.id) === selectedDonationId);
  const donorLat = currentDonation?.latitude || currentDonation?.location?.latitude;
  const donorLng = currentDonation?.longitude || currentDonation?.location?.longitude;

  const mongoNgos = recommendations.filter((r) => r.source === 'mongodb' || !r.source);
  const osmNgos = recommendations.filter((r) => r.source === 'osm');

  const selectedNgoLat = selectedNgo?.location?.latitude;
  const selectedNgoLng = selectedNgo?.location?.longitude;

  const polylinePoints = (donorLat && donorLng && selectedNgoLat && selectedNgoLng) ? [
    [donorLat, donorLng],
    [selectedNgoLat, selectedNgoLng]
  ] : [];

  const mapMarkers = [
    ...(donorLat && donorLng ? [{
      id: 'donation-pickup',
      type: 'donation',
      position: [donorLat, donorLng],
      foodName: currentDonation?.foodName || currentDonation?.name || 'Food Item',
      quantity: currentDonation?.quantity,
      unit: currentDonation?.unit,
      expiryTime: currentDonation?.expiryTime
    }] : []),
    ...recommendations
      .filter((r) => r.location?.latitude && r.location?.longitude)
      .map((r, idx) => ({
        id: r.ngoId || `ngo-${idx}`,
        type: 'ngo',
        position: [r.location.latitude, r.location.longitude],
        ngoName: r.ngoName,
        distance: r.distance,
        verificationStatus: r.source === 'mongodb' ? 'Verified Partner' : 'OSM Nearby',
        isVerified: r.source === 'mongodb'
      }))
  ];

  const travelTimeMinutes = selectedNgo?.distance ? Math.round((selectedNgo.distance / 30) * 60) : null;
  const googleMapsUrl = (donorLat && donorLng && selectedNgoLat && selectedNgoLng)
    ? `https://www.google.com/maps/dir/?api=1&origin=${donorLat},${donorLng}&destination=${selectedNgoLat},${selectedNgoLng}`
    : '#';

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="AI NGO Recommendation"
        subtitle="Match food donations with optimal recipient NGOs using live data and ML ranking"
      />

      <Card icon={<FiCpu className="h-5 w-5" />} title="Smart NGO Matcher">
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#FFF4E1]/40 p-4 rounded-2xl border border-[#89D7B7]">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Select Food Donation
            </label>
            <select
              value={selectedDonationId}
              onChange={(e) => setSelectedDonationId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
            >
              <option value="">Select a food donation...</option>
              {donations.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.foodName || d.name || d.title || `${d.quantity || ''} ${d.unit || ''}`} — {d.pickupAddress || 'Address N/A'}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:self-end">
            <Button
              onClick={handleRecommend}
              loading={submitting}
              disabled={submitting || loading || !selectedDonationId}
              className="w-full sm:w-auto px-6 py-2.5"
            >
              Generate AI Match
            </Button>
          </div>
        </div>

        {warningMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-bold text-amber-800">
            <FiAlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <span>{warningMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center"><Spinner size={44} /></div>
        ) : insufficientMsg ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-2">
            <FiAlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
            <h4 className="text-base font-bold text-amber-900">{insufficientMsg}</h4>
          </div>
        ) : recommendations.length === 0 ? (
          <EmptyState
            title="No AI Matches Found"
            description="Select a donation and click 'Generate AI Match' to discover recommended recipient NGOs."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {mongoNgos.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-extrabold text-[#1A312C] uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Verified Platform NGOs ({mongoNgos.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {mongoNgos.map((r, idx) => {
                      const matchScore = Math.round(r.score || 0);
                      const isSelected = selectedNgo?.ngoId === r.ngoId;
                      return (
                        <div
                          key={r.ngoId || idx}
                          onClick={() => setSelectedNgo(r)}
                          className={`rounded-2xl border p-5 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#428475] bg-emerald-50/40 shadow-elevated ring-2 ring-[#428475]/30'
                              : 'border-[#89D7B7] bg-white shadow-card hover:shadow-elevated'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="font-extrabold text-[#1A312C] text-base">{r.ngoName}</h4>
                              <div className="flex items-center gap-1 text-xs font-semibold text-[#428475] mt-0.5">
                                <FiMapPin className="h-3.5 w-3.5" />
                                <span>{r.distance ? `${r.distance} km away` : 'Nearby area'}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="success" className="flex items-center gap-1">
                                <FiAward className="h-3 w-3" />
                                <span>{matchScore}% Match</span>
                              </Badge>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2 text-xs font-medium text-slate-600">
                            {r.recommendationReason && (
                              <div className="flex items-start gap-1.5 bg-[#FFF4E1]/50 p-2.5 rounded-xl border border-slate-100">
                                <FiCheckCircle className="h-4 w-4 text-[#428475] shrink-0 mt-0.5" />
                                <span>{r.recommendationReason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {osmNgos.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-extrabold text-[#1A312C] uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                    External Nearby NGOs (OpenStreetMap) ({osmNgos.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {osmNgos.map((r, idx) => {
                      const matchScore = Math.round(r.score || 0);
                      const isSelected = selectedNgo?.ngoId === r.ngoId;
                      return (
                        <div
                          key={r.ngoId || idx}
                          onClick={() => setSelectedNgo(r)}
                          className={`rounded-2xl border p-5 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-sky-500 bg-sky-50/40 shadow-elevated ring-2 ring-sky-500/30'
                              : 'border-sky-200 bg-white shadow-card hover:shadow-elevated'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="font-extrabold text-[#1A312C] text-base">{r.ngoName}</h4>
                              <div className="flex items-center gap-1 text-xs font-semibold text-sky-700 mt-0.5">
                                <FiMapPin className="h-3.5 w-3.5" />
                                <span>{r.distance ? `${r.distance} km away` : 'Nearby area'}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <FiAward className="h-3 w-3" />
                                <span>{matchScore}% Match</span>
                              </Badge>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                                OSM Nearby
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2 text-xs font-medium text-slate-600">
                            {r.recommendationReason && (
                              <div className="flex items-start gap-1.5 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                                <FiCheckCircle className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                                <span>{r.recommendationReason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Card title="Selected NGO Route & Navigation" icon={<FiNavigation className="h-5 w-5" />}>
                {selectedNgo && donorLat && donorLng ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
                      <LeafletMap
                        key={`map-${selectedNgo.ngoId}`}
                        center={[donorLat, donorLng]}
                        markers={mapMarkers}
                        polylinePoints={polylinePoints}
                        selectedNgo={selectedNgo}
                        selectedDonation={currentDonation}
                      />
                    </div>

                    <div className="rounded-2xl bg-[#FFF4E1]/50 p-4 border border-[#89D7B7] space-y-3">
                      <div className="font-bold text-[#1A312C] text-sm flex items-center justify-between">
                        <span>{selectedNgo.ngoName}</span>
                        <span className="text-xs font-extrabold text-[#428475]">{selectedNgo.score}% Match</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                          <span className="text-slate-500 block">Est. Distance</span>
                          <span className="font-extrabold text-[#428475] text-sm">{selectedNgo.distance} km</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                          <span className="text-slate-500 block">Est. Drive Time</span>
                          <span className="font-extrabold text-[#1A312C] text-sm">
                            {travelTimeMinutes !== null ? `${travelTimeMinutes} mins` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#428475] text-white py-2.5 text-xs font-bold shadow-md hover:bg-[#1A312C] transition-all"
                      >
                        <FiExternalLink className="h-4 w-4" />
                        <span>Open in Google Maps</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500">
                    Click on any recommended NGO card to view route navigation details.
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
};

export default Recommendation;
