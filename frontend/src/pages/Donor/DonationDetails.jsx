import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import donationService from '../../services/donation.service';
import requestService from '../../services/request.service';
import { getFoodImageUrl } from '../../utils/image';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import NGOMap from '../../components/maps/NGOMap';
import matchingService from '../../services/matching.service';
import toast from 'react-hot-toast';
import { FiMapPin, FiBox, FiImage, FiAward, FiAlertCircle, FiInfo, FiPhone, FiMail } from 'react-icons/fi';

const formatMatchScore = (score) => {
  if (score === undefined || score === null) return '0%';
  const val = Number(score);
  if (isNaN(val)) return '0%';
  if (val <= 1.0 && val > 0) return `${Math.round(val * 100)}%`;
  return `${Math.round(val)}%`;
};

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [selectedNgoModal, setSelectedNgoModal] = useState(null);

  const [matchesState, setMatchesState] = useState({
    matches: [],
    aiAvailable: true,
    loading: true,
    message: ''
  });

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
          // Requests optional
        }

        try {
          const mRes = await matchingService.getDonationMatches(id);
          if (mounted) {
            const mData = mRes?.data || mRes || {};
            const rawMatches = Array.isArray(mData.matches) ? mData.matches : [];
            const sortedMatches = [...rawMatches].sort((a, b) => {
              const scoreA = Number(a.matchScore || 0);
              const scoreB = Number(b.matchScore || 0);
              return scoreB - scoreA;
            });

            setMatchesState({
              matches: sortedMatches,
              aiAvailable: mData.aiAvailable !== false,
              loading: false,
              message: mRes?.message || ''
            });
          }
        } catch (mErr) {
          console.warn('Failed to load NGO matches:', mErr);
          if (mounted) {
            setMatchesState({
              matches: [],
              aiAvailable: false,
              loading: false,
              message: 'NGO recommendations are temporarily unavailable.'
            });
          }
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
    if (!requestId || respondingId || respondingTo) return;
    setRespondingId(requestId);
    setRespondingTo(requestId);
    try {
      await requestService.updateRequestStatus(requestId, action === 'accept' ? 'ACCEPTED' : 'REJECTED');
      toast.success(`Request ${action === 'accept' ? 'accepted' : 'rejected'}`);
      const reqs = await requestService.listRequests({ donationId: id });
      setRequests(Array.isArray(reqs) ? reqs : Array.isArray(reqs?.data) ? reqs.data : []);
    } catch (err) {
      console.error('Request update failure:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update request';
      toast.error(errMsg);
    } finally {
      setRespondingId(null);
      setRespondingTo(null);
    }
  };

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;
  if (!donation) return <EmptyState title="Not found" description="Donation record does not exist." />;

  const mapCenter = [donation.latitude || 28.6139, donation.longitude || 77.2090];
  const markers = [
    { id: donation._id, type: 'donation', position: mapCenter, foodName: donation.foodName, quantity: donation.quantity },
    ...matchesState.matches
      .filter((m) => m.latitude && m.longitude)
      .map((m) => ({
        id: m.ngoId,
        type: 'verified_ngo',
        position: [m.latitude, m.longitude],
        ngoName: m.ngoName,
        matchScore: formatMatchScore(m.matchScore)
      }))
  ];

  return (
    <section className="py-6 space-y-6">
      <PageHeader title={donation.foodName || donation.name || 'Donation Details'} subtitle="Review donation status and incoming requests" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Donation Overview" icon={<FiBox className="h-5 w-5" />}>
          <div className="flex flex-col gap-4">
            {(!imageError && getFoodImageUrl(donation)) ? (
              <img
                src={getFoodImageUrl(donation)}
                alt={donation.foodName || donation.name || 'Food Donation'}
                onError={() => setImageError(true)}
                className="h-56 w-full rounded-2xl object-cover border border-[#89D7B7] shadow-sm"
              />
            ) : (
              <div className="h-56 w-full rounded-2xl border border-[#89D7B7] bg-[#FFF4E1]/40 flex flex-col items-center justify-center gap-2 text-slate-500 shadow-xs p-4 text-center">
                <FiImage className="h-10 w-10 text-[#428475]/60" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">No image uploaded</span>
                <span className="text-[11px] text-slate-400 font-medium">Donor did not attach a food photo</span>
              </div>
            )}
            <div className="space-y-2 text-xs font-medium text-[#1A312C]">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">{donation.category || 'General'}</Badge>
                <Badge variant="success">{donation.status || 'AVAILABLE'}</Badge>
              </div>
              <div><span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Quantity</span> <span className="text-sm font-extrabold text-[#428475]">{donation.quantity} {donation.unit || 'servings'}</span></div>
              <div><span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Pickup Address</span> <span className="font-semibold text-slate-800">{donation.pickupAddress || 'Address not specified'}</span></div>
              <div><span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Expiry</span> <span className="text-amber-700 font-bold">{donation.expiryTime || 'N/A'}</span></div>
              {donation.description && (
                <div className="pt-2 border-t border-slate-100 text-slate-600 leading-relaxed text-[11px]">{donation.description}</div>
              )}
            </div>
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
                    <Button
                      onClick={() => handleRespond(r._id || r.id, 'accept')}
                      loading={respondingId === (r._id || r.id) || respondingTo === (r._id || r.id)}
                      disabled={respondingId !== null || respondingTo !== null}
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleRespond(r._id || r.id, 'reject')}
                      loading={respondingId === (r._id || r.id) || respondingTo === (r._id || r.id)}
                      disabled={respondingId !== null || respondingTo !== null}
                      className="bg-white text-red-600 border border-slate-200"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Recommended NGO Matches"
        icon={<FiAward className="h-5 w-5 text-[#428475]" />}
      >
        {!matchesState.aiAvailable && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800 border border-amber-200">
            <FiAlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>NGO recommendations are temporarily unavailable.</span>
          </div>
        )}

        {matchesState.loading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <Spinner size={24} />
            <span>Finding suitable NGOs...</span>
          </div>
        ) : matchesState.matches.length === 0 ? (
          <div className="py-6 text-center text-xs font-medium text-slate-500">
            No suitable NGOs found for this donation.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchesState.matches.map((m, idx) => {
              const numericScore = Number(m.matchScore || 0);
              const isHighMatch = numericScore >= 0.8 || numericScore >= 80;
              const isMedMatch = numericScore >= 0.5 || numericScore >= 50;

              return (
                <div
                  key={m.ngoId || idx}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#89D7B7] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#428475] uppercase tracking-wider block">Rank #{idx + 1}</span>
                      <h4 className="text-sm font-bold text-[#1A312C] line-clamp-1">{m.ngoName}</h4>
                      {m.city && <p className="text-xs text-slate-500 font-medium">{m.city}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Match Score</span>
                      <Badge variant={isHighMatch ? 'success' : isMedMatch ? 'secondary' : 'default'}>
                        {formatMatchScore(m.matchScore)}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-slate-700">
                    Distance: <span className="font-extrabold text-[#428475]">{m.distanceKm != null ? `${m.distanceKm} km` : 'N/A'}</span>
                  </div>

                  {m.factors && typeof m.factors === 'object' && Object.keys(m.factors).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FFF4E1]/30 p-2.5 rounded-xl border border-slate-100 font-medium text-slate-700">
                      {m.factors.distance && (
                        <div><strong className="text-slate-500 block text-[9px] uppercase">Proximity</strong> {m.factors.distance}</div>
                      )}
                      {m.factors.quantityCompatibility && (
                        <div><strong className="text-slate-500 block text-[9px] uppercase">Capacity</strong> {m.factors.quantityCompatibility}</div>
                      )}
                      {m.factors.urgency && (
                        <div><strong className="text-slate-500 block text-[9px] uppercase">Urgency</strong> {m.factors.urgency}</div>
                      )}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedNgoModal(m)}
                    className="w-full text-xs gap-1.5 py-1.5"
                  >
                    <FiInfo className="h-3.5 w-3.5" />
                    View NGO
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card icon={<FiMapPin className="h-5 w-5" />} title="Pickup & NGO Route Map">
        <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
          <NGOMap
            pickupLocation={{
              latitude: donation.latitude,
              longitude: donation.longitude,
              address: donation.pickupAddress
            }}
            initialNgos={matchesState.matches
              .filter((m) => m.latitude && m.longitude)
              .map((m) => ({
                id: m.ngoId,
                name: m.ngoName,
                organizationName: m.ngoName,
                address: m.city || 'Surat',
                latitude: m.latitude,
                longitude: m.longitude,
                capacity: m.capacity || 150,
                isVerified: true
              }))}
          />
        </div>
      </Card>

      <Modal
        open={Boolean(selectedNgoModal)}
        onClose={() => setSelectedNgoModal(null)}
        title={selectedNgoModal?.ngoName || 'NGO Details'}
      >
        {selectedNgoModal && (
          <div className="space-y-4 text-xs font-medium text-[#1A312C]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verification</span>
                <Badge variant="success">Verified Partner</Badge>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Match Score</span>
                <span className="text-base font-extrabold text-[#428475]">{formatMatchScore(selectedNgoModal.matchScore)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div><strong className="text-slate-500 uppercase text-[10px] block">Location / City</strong> {selectedNgoModal.city || 'Local Region'}</div>
              <div><strong className="text-slate-500 uppercase text-[10px] block">Calculated Distance</strong> {selectedNgoModal.distanceKm != null ? `${selectedNgoModal.distanceKm} km` : 'N/A'}</div>
              {selectedNgoModal.phone && (
                <div className="flex items-center gap-2"><FiPhone className="h-3.5 w-3.5 text-[#428475]" /> <span>{selectedNgoModal.phone}</span></div>
              )}
              {selectedNgoModal.email && (
                <div className="flex items-center gap-2"><FiMail className="h-3.5 w-3.5 text-[#428475]" /> <span>{selectedNgoModal.email}</span></div>
              )}
            </div>

            {selectedNgoModal.factors && typeof selectedNgoModal.factors === 'object' && Object.keys(selectedNgoModal.factors).length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <strong className="text-slate-500 uppercase text-[10px] block mb-2">Match Factors</strong>
                <div className="grid grid-cols-3 gap-2 bg-[#FFF4E1]/40 p-3 rounded-xl text-center">
                  {selectedNgoModal.factors.distance && (
                    <div><span className="block text-[9px] uppercase text-slate-400 font-bold">Proximity</span> <span className="font-extrabold text-[#428475]">{selectedNgoModal.factors.distance}</span></div>
                  )}
                  {selectedNgoModal.factors.quantityCompatibility && (
                    <div><span className="block text-[9px] uppercase text-slate-400 font-bold">Capacity</span> <span className="font-extrabold text-[#428475]">{selectedNgoModal.factors.quantityCompatibility}</span></div>
                  )}
                  {selectedNgoModal.factors.urgency && (
                    <div><span className="block text-[9px] uppercase text-slate-400 font-bold">Urgency</span> <span className="font-extrabold text-[#428475]">{selectedNgoModal.factors.urgency}</span></div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
};

export default DonationDetails;
