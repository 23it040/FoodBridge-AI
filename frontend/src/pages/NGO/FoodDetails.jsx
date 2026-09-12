import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import donationService from '../../services/donation.service';
import requestService from '../../services/request.service';
import aiService from '../../services/ai.service';
import { useAuth } from '../../context/AuthContext';
import { getFoodImageUrl } from '../../utils/image';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import LeafletMap from '../../components/maps/LeafletMap';
import toast from 'react-hot-toast';
import { FiBox, FiMapPin, FiCalendar, FiSend, FiUser, FiPhone, FiTruck, FiShield, FiInfo, FiImage } from 'react-icons/fi';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [imageError, setImageError] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: '18:00',
      requestMessage: 'We would like to request this food item for community distribution.',
      contactPerson: user?.name || '',
      contactNumber: user?.phone || '',
      beneficiaries: 20,
      specialNotes: ''
    }
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const d = await donationService.getDonation(id);
        if (!mounted) return;
        const dObj = d?.data || d || null;
        setDonation(dObj);

        if (dObj) {
          try {
            const riskRes = await aiService.riskScore({ food_category: dObj.category, donation: dObj });
            if (mounted) setRiskAssessment(riskRes?.data || riskRes);
          } catch (e) {
            if (mounted) setRiskAssessment({ insufficientData: true, message: 'Quality risk assessment unavailable.' });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    if (user) {
      reset((prev) => ({
        ...prev,
        contactPerson: user.name || prev.contactPerson,
        contactNumber: user.phone || prev.contactNumber
      }));
    }
  }, [user, reset]);

  const onRequestSubmit = async (values) => {
    setSending(true);
    try {
      const payload = {
        foodId: id,
        requestMessage: `${values.requestMessage} [Contact: ${values.contactPerson} (${values.contactNumber}), Beneficiaries: ${values.beneficiaries}${values.specialNotes ? `, Note: ${values.specialNotes}` : ''}]`,
        pickupDate: new Date(`${values.pickupDate}T${values.pickupTime}:00`).toISOString(),
        pickupTime: values.pickupTime
      };

      await requestService.createRequest(payload);
      toast.success('Food pickup request submitted successfully!');
      navigate('/ngo/my-requests');
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to submit food request');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;
  if (!donation) return <EmptyState title="Item Not Found" description="The requested food donation item could not be found." />;

  const lat = Number(donation.latitude || donation.location?.latitude || 0);
  const lng = Number(donation.longitude || donation.location?.longitude || 0);
  const hasMapCoords = lat !== 0 || lng !== 0;

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title={donation.foodName || donation.name || 'Food Item Details'}
        subtitle={`Donated by ${donation.donorName || donation.donorId?.name || 'Verified Food Donor'}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Donation Overview" icon={<FiBox className="h-5 w-5" />}>
            <div className="flex flex-col md:flex-row gap-6">
              {(!imageError && getFoodImageUrl(donation)) ? (
                <img
                  src={getFoodImageUrl(donation)}
                  alt={donation.foodName || donation.name || 'Food Item'}
                  onError={() => setImageError(true)}
                  className="h-56 w-full md:w-72 rounded-2xl object-cover border border-[#89D7B7] shadow-sm"
                />
              ) : (
                <div className="h-56 w-full md:w-72 rounded-2xl border border-[#89D7B7] bg-[#FFF4E1]/40 flex flex-col items-center justify-center gap-2 text-slate-500 shadow-xs p-4 text-center shrink-0">
                  <FiImage className="h-10 w-10 text-[#428475]/60" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">No image uploaded</span>
                  <span className="text-[11px] text-slate-400 font-medium">Donor did not attach a food photo</span>
                </div>
              )}
              <div className="space-y-3.5 text-xs font-medium flex-1 text-[#1A312C]">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{donation.category || 'General'}</Badge>
                  <Badge variant="success">{donation.status || 'AVAILABLE'}</Badge>
                </div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider block">Quantity Available</span> <span className="text-base font-extrabold text-[#428475]">{donation.quantity} {donation.unit || 'servings'}</span></div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider block">Expiry Date / Time</span> <span className="text-amber-700 font-bold">{donation.expiryTime || 'Within 24 Hours'}</span></div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider block">Pickup Address</span> <span className="font-semibold text-slate-800">{donation.pickupAddress || 'Address specified upon request'}</span></div>
                <div className="pt-3 border-t border-slate-100 text-slate-600 leading-relaxed">{donation.description || 'No additional description provided.'}</div>
              </div>
            </div>
          </Card>

          {/* AI Food Quality Assessment Section */}
          <Card icon={<FiShield className="h-5 w-5" />} title="AI Food Quality Assessment">
            {riskAssessment && !riskAssessment.insufficientData ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1A312C] uppercase text-sm">Assessed Grade: {riskAssessment.prediction}</span>
                  <Badge variant={riskAssessment.riskLevel === 'HIGH_RISK' ? 'danger' : 'success'}>{riskAssessment.riskLevel}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200">
                  <div><span className="font-semibold">Model Name:</span> Milk Quality Risk Model</div>
                  <div><span className="font-semibold">Algorithm:</span> Random Forest Classifier</div>
                  <div><span className="font-semibold">Model Status:</span> <span className="font-mono text-amber-700">{riskAssessment.modelStatus || 'EXTERNAL_DATA_MODEL'}</span></div>
                  <div><span className="font-semibold">Data Source:</span> {riskAssessment.dataSource || 'Public Milk Quality Dataset'}</div>
                  <div><span className="font-semibold">Model Version:</span> {riskAssessment.modelVersion || '1.0.0'}</div>
                </div>
                <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                  Limitation: Model trained on public milk-quality data; not trained on FoodBridge historical outcomes.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <FiInfo className="h-4 w-4 text-slate-500 shrink-0" />
                <span>{riskAssessment?.message || 'Current AI quality model supports milk quality only when sensor measurements are collected.'}</span>
              </div>
            )}
          </Card>

          <Card title="Pickup Location Map" icon={<FiMapPin className="h-5 w-5" />}>
            <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
              {hasMapCoords ? (
                <LeafletMap
                  key={`food-details-map-${id}`}
                  center={[lat, lng]}
                  selectedDonation={donation}
                  markers={[{
                    id: donation._id || donation.id,
                    type: 'donation',
                    position: [lat, lng],
                    foodName: donation.foodName || donation.name,
                    quantity: donation.quantity,
                    unit: donation.unit,
                    expiryTime: donation.expiryTime
                  }]}
                />
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">Map coordinates not available for this item.</div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Submit Pickup Request" icon={<FiSend className="h-5 w-5" />}>
            <form onSubmit={handleSubmit(onRequestSubmit)} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FiCalendar className="h-3.5 w-3.5 text-[#428475]" />
                  <span>Pickup Date *</span>
                </label>
                <input
                  type="date"
                  {...register('pickupDate', { required: 'Pickup date is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
                />
                {errors.pickupDate && <p className="mt-1 text-red-600 font-semibold">{errors.pickupDate.message}</p>}
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FiCalendar className="h-3.5 w-3.5 text-[#428475]" />
                  <span>Pickup Time *</span>
                </label>
                <input
                  type="time"
                  {...register('pickupTime', { required: 'Pickup time is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
                />
                {errors.pickupTime && <p className="mt-1 text-red-600 font-semibold">{errors.pickupTime.message}</p>}
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FiUser className="h-3.5 w-3.5 text-[#428475]" />
                  <span>Contact Person *</span>
                </label>
                <input
                  type="text"
                  {...register('contactPerson', { required: 'Contact person is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
                />
                {errors.contactPerson && <p className="mt-1 text-red-600 font-semibold">{errors.contactPerson.message}</p>}
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FiPhone className="h-3.5 w-3.5 text-[#428475]" />
                  <span>Contact Phone Number *</span>
                </label>
                <input
                  type="tel"
                  {...register('contactNumber', { required: 'Contact phone is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
                />
                {errors.contactNumber && <p className="mt-1 text-red-600 font-semibold">{errors.contactNumber.message}</p>}
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FiTruck className="h-3.5 w-3.5 text-[#428475]" />
                  <span>Estimated Beneficiaries</span>
                </label>
                <input
                  type="number"
                  min={1}
                  {...register('beneficiaries', { valueAsNumber: true })}
                  className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3 py-2 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                  Request Message
                </label>
                <textarea
                  {...register('requestMessage')}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3 py-2 text-xs font-medium text-[#1A312C] outline-none focus:border-[#428475]"
                />
              </div>

              <Button type="submit" loading={sending} className="w-full py-3 text-xs font-bold uppercase tracking-wider">
                Send Pickup Request
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FoodDetails;
