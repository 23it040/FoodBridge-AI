import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import donationService from '../../services/donation.service';
import requestService from '../../services/request.service';
import aiService from '../../services/ai.service';
import { getDirectionsUrl } from '../../services/maps.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import AIStatusBadge from '../../components/ai/AIStatusBadge';
import AIExplanation from '../../components/ai/AIExplanation';
import LeafletMap from '../../components/maps/LeafletMap';
import toast from 'react-hot-toast';
import { FiCpu, FiMapPin, FiAward, FiShield, FiInfo, FiTrendingUp, FiNavigation } from 'react-icons/fi';

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState(null);
  const [selectedNgo, setSelectedNgo] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const d = await donationService.getDonation(id);
        if (!mounted) return;
        const dObj = d?.data || d;
        setDonation(dObj);

        try {
          const reqs = await requestService.listRequests({ donationId: id });
          if (mounted) setRequests(Array.isArray(reqs) ? reqs : Array.isArray(reqs?.data) ? reqs.data : []);
        } catch (e) {
          // optional
        }

        try {
          const decRes = await aiService.getDecision(id);
          if (mounted) setDecision(decRes?.data || decRes);
        } catch (e) {
          console.warn('AI Decision fetch failed:', e);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load donation details');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => (mounted = false);
  }, [id]);

  const handleRespond = async (requestId, action) => {
    try {
      await requestService.updateRequestStatus(requestId, action === 'accept' ? 'ACCEPTED' : 'REJECTED');
      toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'}`);
      const reqs = await requestService.listRequests({ donationId: id });
      setRequests(Array.isArray(reqs) ? reqs : Array.isArray(reqs?.data) ? reqs.data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request');
    }
  };

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;
  if (!donation) return <EmptyState title="Not found" description="Donation record does not exist." />;

  const demandInfo = decision?.demand || {};
  const riskInfo = decision?.risk || {};
  const recInfo = decision?.recommendations || {};
  const priorityInfo = decision?.priority || {};

  const ngosList = recInfo?.recommendations || [];
  const mapCenter = [donation.latitude || 28.6139, donation.longitude || 77.2090];
  const markers = [
    { id: donation._id, type: 'donation', position: mapCenter, foodName: donation.foodName, quantity: donation.quantity },
    ...ngosList.map((n) => ({
      id: n.ngoId || n.id,
      type: 'ngo',
      position: [n.latitude || 28.6139, n.longitude || 77.2090],
      name: n.ngoName || n.name,
      address: n.source === 'mongodb' ? 'Verified MongoDB Partner' : 'OpenStreetMap Registered NGO'
    }))
  ];

  return (
    <section className="py-6 space-y-6">
      <PageHeader title={donation.foodName || donation.name || 'Donation Details'} subtitle="Review donation status, incoming requests, and AI analytics" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Details">
          <div className="space-y-2 text-sm">
            <div><strong>Category:</strong> {donation.category}</div>
            <div><strong>Quantity:</strong> {donation.quantity} {donation.unit}</div>
            <div><strong>Pickup Address:</strong> {donation.pickupAddress}</div>
            <div><strong>Expiry:</strong> {donation.expiryTime}</div>
            <div className="mt-3 text-xs text-slate-600">{donation.description}</div>
          </div>
        </Card>

        <Card title="NGO Requests" className="lg:col-span-2">
          {requests.length === 0 ? (
            <EmptyState title="No requests" description="No NGOs have requested this donation yet." />
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <div key={r._id || r.id} className="flex items-start justify-between rounded-lg border p-4">
                  <div>
                    <div className="text-sm font-semibold">{r.ngoName || r.requestedByName}</div>
                    <div className="text-sm text-slate-600">{r.message}</div>
                    <div className="text-xs text-slate-400">Distance: {r.distance || '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleRespond(r._id || r.id, 'accept')}>Accept</Button>
                    <Button onClick={() => handleRespond(r._id || r.id, 'reject')} className="bg-white text-red-600">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* AI Redistribution Intelligence Section */}
      <Card icon={<FiCpu className="h-5 w-5" />} title="AI Redistribution Intelligence">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Demand Insight Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-extrabold text-[#1A312C] text-sm flex items-center gap-1.5">
                <FiTrendingUp className="h-4 w-4 text-[#428475]" />
                <span>Demand Insight</span>
              </h4>
              <AIStatusBadge status={demandInfo.modelStatus || 'EXTERNAL_DATA_MODEL'} />
            </div>
            {demandInfo.insufficientData ? (
              <p className="text-[#1A312C] pt-2">{demandInfo.message || 'Demand prediction unavailable.'}</p>
            ) : (
              <div className="space-y-1 text-[#1A312C] pt-2 border-t border-slate-200">
                <div>Predicted Demand: <span className="font-extrabold text-[#428475]">{Math.round(demandInfo.prediction || 0)} meals</span></div>
              </div>
            )}
            <AIExplanation
              modelName="Demand Forecast Model"
              status={demandInfo.modelStatus || 'EXTERNAL_DATA_MODEL'}
              dataSource="Kaggle Food Demand Forecasting"
              foodBridgeTrained={false}
              limitations="External benchmark model; not yet trained on FoodBridge historical records."
            />
          </div>

          {/* Risk Insight Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-extrabold text-[#1A312C] text-sm flex items-center gap-1.5">
                <FiShield className="h-4 w-4 text-[#428475]" />
                <span>Food Safety Risk</span>
              </h4>
              <AIStatusBadge status={riskInfo.modelStatus || 'EXTERNAL_DATA_MODEL'} />
            </div>
            {riskInfo.insufficientData ? (
              <p className="text-[#1A312C] pt-2">{riskInfo.message || 'Current AI food-risk model is trained only for milk quality.'}</p>
            ) : (
              <div className="space-y-1 text-[#1A312C] pt-2 border-t border-slate-200">
                <div>Grade: <span className="font-extrabold uppercase">{riskInfo.prediction}</span></div>
              </div>
            )}
            <AIExplanation
              modelName="Milk Quality Risk Model"
              status={riskInfo.modelStatus || 'EXTERNAL_DATA_MODEL'}
              dataSource="Public Milk Quality Dataset"
              foodBridgeTrained={false}
              limitations="Scope limited strictly to milk quality with required physical sensor measurements."
            />
          </div>

          {/* Priority Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-extrabold text-[#1A312C] text-sm flex items-center gap-1.5">
                <FiAward className="h-4 w-4 text-[#428475]" />
                <span>Donation Priority</span>
              </h4>
              <AIStatusBadge status={priorityInfo.modelStatus || 'INSUFFICIENT_DATA'} />
            </div>
            <div className="space-y-1 text-[#1A312C] pt-2 border-t border-slate-200">
              <div>Records: <span className="font-bold">{priorityInfo.recordsAvailable ?? 0} / 500</span></div>
              <div>Weeks: <span className="font-bold">{priorityInfo.weeksAvailable ?? 0} / 12</span></div>
            </div>
            <AIExplanation
              modelName="FoodBridge Priority Model"
              status={priorityInfo.modelStatus || 'INSUFFICIENT_DATA'}
              dataSource="FoodBridge MongoDB"
              foodBridgeTrained={false}
              limitations="Priority model is awaiting sufficient real FoodBridge historical transaction volume."
            />
          </div>
        </div>
      </Card>

      {/* Map & Real NGO Matching Section */}
      <Card icon={<FiMapPin className="h-5 w-5" />} title="AI Recommended Recipients & Navigation Route">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
            <LeafletMap center={mapCenter} markers={markers} />
          </div>

          {ngosList.length > 0 ? (
            <div className="space-y-4">
              {/* 1. Verified FoodBridge NGOs */}
              {ngosList.filter((n) => n.source === 'mongodb').length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    Verified FoodBridge NGOs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ngosList.filter((n) => n.source === 'mongodb').map((ngo) => (
                      <div
                        key={ngo.ngoId || ngo.id}
                        onClick={() => setSelectedNgo(ngo)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                          selectedNgo?.ngoId === (ngo.ngoId || ngo.id) ? 'border-[#428475] bg-[#FFF4E1]/40 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[#1A312C] text-sm">{ngo.ngoName || ngo.name}</span>
                          <Badge variant="success">Verified Partner</Badge>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 font-medium">
                          <span>Match Score: <strong className="text-emerald-700 font-extrabold">{ngo.matchScore || ngo.score || '—'}%</strong></span>
                          <span>Distance: <strong className="text-slate-800">{ngo.distanceKm || ngo.distance || '—'} km</strong> (straight line)</span>
                        </div>
                        {ngo.recommendationReason && (
                          <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/50 text-[11px] text-emerald-900">
                            <strong>Reason:</strong> {ngo.recommendationReason}
                          </div>
                        )}
                        <div className="pt-1 flex items-center justify-between">
                          <a
                            href={getDirectionsUrl(donation, ngo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#428475] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiNavigation className="h-3.5 w-3.5" />
                            <span>Navigate in Google Maps</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. External Nearby Organizations */}
              {ngosList.filter((n) => n.source === 'osm').length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    External Nearby Organizations (OpenStreetMap)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ngosList.filter((n) => n.source === 'osm').map((ngo) => (
                      <div
                        key={ngo.ngoId || ngo.id}
                        onClick={() => setSelectedNgo(ngo)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                          selectedNgo?.ngoId === (ngo.ngoId || ngo.id) ? 'border-amber-500 bg-amber-50/40 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[#1A312C] text-sm">{ngo.ngoName || ngo.name}</span>
                          <Badge variant="default">External OSM</Badge>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 font-medium">
                          <span>Match Score: <strong className="text-amber-700 font-extrabold">{ngo.matchScore || ngo.score || '—'}%</strong></span>
                          <span>Distance: <strong className="text-slate-800">{ngo.distanceKm || ngo.distance || '—'} km</strong> (straight line)</span>
                        </div>
                        {ngo.recommendationReason && (
                          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-700">
                            <strong>Reason:</strong> {ngo.recommendationReason}
                          </div>
                        )}
                        <div className="pt-1 flex items-center justify-between">
                          <a
                            href={getDirectionsUrl(donation, ngo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#428475] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiNavigation className="h-3.5 w-3.5" />
                            <span>Navigate in Google Maps</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <FiInfo className="h-4 w-4 text-slate-500 shrink-0" />
              <span>No verified or external nearby food organizations with valid location data were found.</span>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};

export default DonationDetails;
