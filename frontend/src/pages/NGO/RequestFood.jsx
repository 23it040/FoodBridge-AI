import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import requestService from '../../services/request.service';
import donationService from '../../services/donation.service';
import aiService from '../../services/ai.service';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { FiSend, FiBox, FiCalendar, FiUser, FiPhone, FiTruck, FiTrendingUp, FiInfo } from 'react-icons/fi';

const RequestFood = ({ donationId: propDonationId }) => {
  const params = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const targetDonationId =
    propDonationId ||
    params.donationId ||
    params.id ||
    location.state?.donationId ||
    location.state?.id ||
    searchParams.get('donationId') ||
    searchParams.get('id');

  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [sending, setSending] = useState(false);
  const [demandContext, setDemandContext] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      foodId: targetDonationId || '',
      pickupDate: new Date().toISOString().split('T')[0],
      pickupTime: '18:00',
      requestMessage: 'We request this food donation for community distribution and shelter support.',
      contactPerson: user?.name || '',
      contactNumber: user?.phone || '',
      beneficiaries: 25,
      vehicleRequired: 'Standard Vehicle',
      specialNotes: ''
    }
  });

  const watchFoodId = watch('foodId');

  useEffect(() => {
    const activeId = targetDonationId || watchFoodId;
    if (!activeId) {
      setSelectedDonation(null);
      return;
    }

    let mounted = true;
    const fetchDonation = async () => {
      setLoadingItem(true);
      try {
        const item = await donationService.getDonation(activeId);
        if (!mounted) return;
        const dObj = item?.data || item || null;
        setSelectedDonation(dObj);
        setValue('foodId', activeId);

        if (dObj) {
          try {
            const res = await aiService.predictDemand({
              food_category: dObj.category || 'Rice Bowl',
              center_type: 'TYPE_A',
              op_area: 5.0,
              previous_donations: 150
            });
            if (mounted) setDemandContext(res?.data || res);
          } catch (err) {
            if (mounted) setDemandContext({ insufficientData: true, message: 'Demand context unavailable.' });
          }
        }
      } catch (err) {
        console.error(err);
        if (mounted) setSelectedDonation(null);
      } finally {
        if (mounted) setLoadingItem(false);
      }
    };

    fetchDonation();
    return () => { mounted = false; };
  }, [targetDonationId, watchFoodId, setValue]);

  useEffect(() => {
    const loadDonations = async () => {
      setLoadingDonations(true);
      try {
        const list = await donationService.listDonations();
        const available = (Array.isArray(list) ? list : []).filter((d) => !d.status || d.status === 'AVAILABLE' || d.status === 'available');
        setDonations(available);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDonations(false);
      }
    };
    loadDonations();
  }, []);

  const onSubmit = async (values) => {
    if (!values.foodId) {
      toast.error('Please select a food donation item');
      return;
    }

    setSending(true);
    try {
      const payload = {
        foodId: values.foodId,
        pickupDate: values.pickupDate,
        pickupTime: values.pickupTime,
        requestMessage: values.requestMessage,
        contactPerson: values.contactPerson,
        contactNumber: values.contactNumber,
        beneficiaries: Number(values.beneficiaries) || 1,
        vehicleRequired: values.vehicleRequired,
        specialNotes: values.specialNotes
      };

      await requestService.createRequest(payload);
      toast.success('Food pickup request submitted to donor!');
      navigate('/ngo/my-requests');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit request';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Submit Food Pickup Request"
        subtitle="Request surplus food items from verified donors for non-profit distribution"
      />

      {loadingItem ? (
        <div className="py-8 text-center"><Spinner size={36} /></div>
      ) : selectedDonation ? (
        <Card title="Selected Food Listing" icon={<FiBox className="h-5 w-5" />}>
          <div className="space-y-3 bg-[#FFF4E1]/40 p-4 rounded-2xl border border-[#89D7B7]">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#1A312C]">{selectedDonation.foodName || selectedDonation.name}</h3>
                <p className="text-xs font-semibold text-slate-500">Donated by: {selectedDonation.donorId?.name || selectedDonation.donorName || 'Verified Donor'}</p>
              </div>
              <Badge variant="success">{selectedDonation.status || 'AVAILABLE'}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-700 pt-2 border-t border-[#89D7B7]/50">
              <div><strong className="text-slate-500 uppercase tracking-wider block">Quantity</strong> {selectedDonation.quantity} {selectedDonation.unit || 'servings'}</div>
              <div><strong className="text-slate-500 uppercase tracking-wider block">Category</strong> {selectedDonation.category || 'General'}</div>
              <div><strong className="text-slate-500 uppercase tracking-wider block">Meal Type</strong> {selectedDonation.mealType || 'Cooked'}</div>
              <div><strong className="text-slate-500 uppercase tracking-wider block">Pickup Address</strong> {selectedDonation.pickupAddress || 'Address specified upon confirmation'}</div>
            </div>

            {demandContext && !demandContext.insufficientData && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 mt-2">
                <div className="font-bold flex items-center gap-1 text-[#1A312C]">
                  <FiTrendingUp className="h-4 w-4 text-[#428475]" />
                  <span>Regional Demand Context</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px] pt-1">
                  <div>Estimated Regional Demand: <span className="font-extrabold text-[#428475]">{Math.round(demandContext.prediction ?? demandContext.expected_meals ?? 0)} meals</span></div>
                  <div>Requested Quantity: <span className="font-bold text-slate-800">{selectedDonation.quantity} {selectedDonation.unit || 'servings'}</span></div>
                </div>
                <div className="text-[10px] text-slate-500 italic">Model: {demandContext.modelStatus || 'EXTERNAL_DATA_MODEL'} | Source: Kaggle</div>
              </div>
            )}
          </div>
        </Card>
      ) : null}

      <Card title="NGO Pickup Request Form" icon={<FiSend className="h-5 w-5" />}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {!targetDonationId && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select Available Food Item *
              </label>
              {loadingDonations ? (
                <div className="py-2"><Spinner size={24} /></div>
              ) : (
                <select
                  {...register('foodId', { required: 'Please select a food donation' })}
                  className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
                >
                  <option value="">-- Select Food Item --</option>
                  {donations.map((d) => (
                    <option key={d._id || d.id} value={d._id || d.id}>
                      {d.foodName || d.name} ({d.quantity} {d.unit || 'servings'}) — Donated by {d.donorName}
                    </option>
                  ))}
                </select>
              )}
              {errors.foodId && <p className="mt-1 text-xs font-semibold text-red-600">{errors.foodId.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5 text-[#428475]" />
                <span>Pickup Date *</span>
              </label>
              <input
                type="date"
                {...register('pickupDate', { required: 'Pickup date is required' })}
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
              />
              {errors.pickupDate && <p className="mt-1 text-xs font-semibold text-red-600">{errors.pickupDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5 text-[#428475]" />
                <span>Pickup Time *</span>
              </label>
              <input
                type="time"
                {...register('pickupTime', { required: 'Pickup time is required' })}
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
              />
              {errors.pickupTime && <p className="mt-1 text-xs font-semibold text-red-600">{errors.pickupTime.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <FiUser className="h-3.5 w-3.5 text-[#428475]" />
                <span>Contact Person *</span>
              </label>
              <input
                type="text"
                {...register('contactPerson', { required: 'Contact person is required' })}
                placeholder="Coordinator Name"
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
              />
              {errors.contactPerson && <p className="mt-1 text-xs font-semibold text-red-600">{errors.contactPerson.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <FiPhone className="h-3.5 w-3.5 text-[#428475]" />
                <span>Contact Phone Number *</span>
              </label>
              <input
                type="tel"
                {...register('contactNumber', { required: 'Contact phone number is required' })}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
              />
              {errors.contactNumber && <p className="mt-1 text-xs font-semibold text-red-600">{errors.contactNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Estimated Beneficiaries / Servings Needed
              </label>
              <input
                type="number"
                min={1}
                {...register('beneficiaries', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <FiTruck className="h-3.5 w-3.5 text-[#428475]" />
                <span>Logistics / Vehicle Required</span>
              </label>
              <select
                {...register('vehicleRequired')}
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
              >
                <option value="Standard Vehicle">Standard Vehicle / Car</option>
                <option value="Refrigerated Van">Refrigerated Van (Perishables)</option>
                <option value="Cargo Truck">Cargo Truck (Bulk Quantity)</option>
                <option value="Two Wheeler">Two Wheeler / Express</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Request Purpose & Message for Donor
            </label>
            <textarea
              {...register('requestMessage')}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-medium text-[#1A312C] outline-none focus:border-[#428475]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={sending} className="px-8 py-3 text-sm">
              Submit Pickup Request
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/ngo/nearby-food')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default RequestFood;
