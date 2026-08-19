import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import donationService from '../../services/donation.service';
import aiService from '../../services/ai.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LeafletMap from '../../components/maps/LeafletMap';
import AIStatusBadge from '../../components/ai/AIStatusBadge';
import AIExplanation from '../../components/ai/AIExplanation';
import { FiBox, FiMapPin, FiCalendar, FiUpload, FiNavigation, FiTrendingUp, FiInfo, FiShield, FiAward } from 'react-icons/fi';

const DonateFood = () => {
  const nowISO = new Date().toISOString().slice(0, 16);
  const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      category: 'Cooked Meals',
      mealType: 'Cooked',
      quantity: 10,
      unit: 'servings',
      pickupAddress: '',
      latitude: 28.6139,
      longitude: 77.2090,
      description: '',
      cookedTime: nowISO,
      expiryTime: defaultExpiry
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [demandInsight, setDemandInsight] = useState(null);
  const [demandLoading, setDemandLoading] = useState(false);
  const [riskInsight, setRiskInsight] = useState(null);
  const [priorityInsight, setPriorityInsight] = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const lat = Number(watch('latitude') || 28.6139);
  const lng = Number(watch('longitude') || 77.2090);
  const foodNameVal = watch('name');
  const quantityVal = watch('quantity');
  const categoryVal = watch('category');

  useEffect(() => {
    let mounted = true;
    const fetchInsights = async () => {
      if (!categoryVal) return;
      setDemandLoading(true);
      try {
        const dRes = await aiService.predictDemand({
          food_category: categoryVal,
          center_type: 'TYPE_A',
          op_area: 5.0,
          previous_donations: 150
        });
        if (mounted) setDemandInsight(dRes?.data || dRes);
      } catch (e) {
        if (mounted) setDemandInsight({ insufficientData: true, message: 'Demand insight unavailable because there is insufficient real historical data.' });
      } finally {
        if (mounted) setDemandLoading(false);
      }

      try {
        const rRes = await aiService.riskScore({
          food_category: categoryVal
        });
        if (mounted) setRiskInsight(rRes?.data || rRes);
      } catch (e) {
        if (mounted) setRiskInsight({ insufficientData: true, message: 'AI assessment unavailable — required food quality measurements were not provided.' });
      }

      try {
        const pRes = await aiService.priorityScore({ food_category: categoryVal });
        if (mounted) setPriorityInsight(pRes?.data || pRes);
      } catch (e) {
        if (mounted) setPriorityInsight({ insufficientData: true, message: 'AI priority prediction unavailable because sufficient FoodBridge historical data has not yet been collected.' });
      }
    };
    fetchInsights();
    return () => (mounted = false);
  }, [categoryVal]);

  const handleLocationSelect = ({ lat: selectedLat, lng: selectedLng }) => {
    setValue('latitude', Number(selectedLat.toFixed(6)));
    setValue('longitude', Number(selectedLng.toFixed(6)));
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const currentLat = Number(pos.coords.latitude.toFixed(6));
          const currentLng = Number(pos.coords.longitude.toFixed(6));
          setValue('latitude', currentLat);
          setValue('longitude', currentLng);
          toast.success('Location updated to current GPS position!');
          setLocating(false);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          toast.error('Unable to fetch GPS position. Please select location on map or type manually.');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('foodName', values.name);
      payload.append('category', values.category || 'General');
      payload.append('quantity', String(values.quantity ?? 1));
      payload.append('unit', values.unit || 'servings');
      payload.append('description', values.description || '');

      const cookedIso = values.cookedTime ? new Date(values.cookedTime).toISOString() : new Date().toISOString();
      const expiryIso = values.expiryTime ? new Date(values.expiryTime).toISOString() : new Date(Date.now() + 86400000).toISOString();

      payload.append('cookedTime', cookedIso);
      payload.append('expiryTime', expiryIso);
      payload.append('pickupAddress', values.pickupAddress || '');
      payload.append('latitude', String(values.latitude ?? 28.6139));
      payload.append('longitude', String(values.longitude ?? 77.2090));

      const file = fileRef.current?.files?.[0];
      if (file) {
        payload.append('foodImage', file);
      }

      await donationService.createDonation(payload);
      toast.success('Food donation posted successfully!');
      navigate('/donor/my-donations');
    } catch (error) {
      console.error('Donation submission error:', error);
      const errMsg = error?.response?.data?.message
        || (Array.isArray(error?.response?.data?.errors) ? error.response.data.errors.map(e => e.msg || e.message).join(', ') : null)
        || error.message
        || 'Failed to create donation';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Donate Surplus Food"
        subtitle="List extra food from restaurants, events, or homes for local NGO pickup"
      />

      <Card title="Donation Form" icon={<FiBox className="h-5 w-5" />}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Food Item Name *</label>
              <input
                {...register('name', { required: 'Food name is required' })}
                placeholder="e.g. Fresh Veg Biryani & Curry"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
              {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Category</label>
              <select
                {...register('category')}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Milk / Dairy">Milk / Dairy</option>
                <option value="Rice Bowl">Rice Bowl / Grains</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Packaged Items">Packaged Items</option>
                <option value="Produce & Fruits">Produce & Fruits</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Meal Type</label>
              <select
                {...register('mealType')}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AI Demand Insight Panel (Optional, non-blocking) */}
            <div className="p-4 rounded-2xl border border-[#89D7B7] bg-[#FFF4E1]/40 space-y-2">
              <div className="flex items-center justify-between font-bold text-xs text-[#1A312C]">
                <span className="flex items-center gap-1.5"><FiTrendingUp className="h-4 w-4 text-[#428475]" /> Demand Preview</span>
                <AIStatusBadge status={demandInsight?.modelStatus || 'EXTERNAL_DATA_MODEL'} />
              </div>
              {demandLoading ? (
                <p className="text-xs text-slate-500">Checking demand model...</p>
              ) : demandInsight?.insufficientData ? (
                <p className="text-xs text-slate-600">Demand prediction unavailable because required features are not available.</p>
              ) : (
                <div className="text-xs text-slate-700 space-y-1">
                  <div>Predicted Demand: <span className="font-extrabold text-[#428475]">{Math.round(demandInsight?.prediction ?? demandInsight?.expected_meals ?? 0)} meals</span></div>
                </div>
              )}
              <AIExplanation
                modelName="Demand Forecast Model"
                status={demandInsight?.modelStatus || 'EXTERNAL_DATA_MODEL'}
                dataSource="Kaggle Food Demand Forecasting"
                foodBridgeTrained={false}
                limitations="External benchmark model; not trained on FoodBridge historical records."
              />
            </div>

            {/* AI Food Quality Assessment Panel (Optional, non-blocking) */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between font-bold text-xs text-[#1A312C]">
                <span className="flex items-center gap-1.5"><FiShield className="h-4 w-4 text-[#428475]" /> Food Quality Risk</span>
                <AIStatusBadge status={riskInsight?.modelStatus || 'EXTERNAL_DATA_MODEL'} />
              </div>
              {!categoryVal || !categoryVal.toLowerCase().includes('milk') ? (
                <p className="text-xs text-slate-600">Current AI risk model supports milk quality only.</p>
              ) : riskInsight?.insufficientData ? (
                <p className="text-xs text-slate-600">Milk quality risk prediction requires actual sensor measurements.</p>
              ) : (
                <div className="text-xs text-slate-700 space-y-1">
                  <div>Assessed Grade: <span className="font-extrabold text-[#428475] uppercase">{riskInsight?.prediction} Grade</span></div>
                </div>
              )}
              <AIExplanation
                modelName="Milk Quality Risk Model"
                status={riskInsight?.modelStatus || 'EXTERNAL_DATA_MODEL'}
                dataSource="Public Milk Quality Dataset"
                foodBridgeTrained={false}
                limitations="Scope limited strictly to milk quality with required physical sensor inputs."
              />
            </div>

            {/* AI Priority Insight Panel (Optional, non-blocking) */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between font-bold text-xs text-[#1A312C]">
                <span className="flex items-center gap-1.5"><FiAward className="h-4 w-4 text-[#428475]" /> Priority Status</span>
                <AIStatusBadge status={priorityInsight?.modelStatus || 'INSUFFICIENT_DATA'} />
              </div>
              <p className="text-xs text-slate-600">FoodBridge Priority Model is currently collecting operational data (0 / 500 records).</p>
              <AIExplanation
                modelName="FoodBridge Priority Model"
                status={priorityInsight?.modelStatus || 'INSUFFICIENT_DATA'}
                dataSource="FoodBridge MongoDB"
                foodBridgeTrained={false}
                limitations="Priority model is awaiting sufficient real FoodBridge historical transaction volume."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Quantity *</label>
              <input
                type="number"
                min={1}
                {...register('quantity', { required: 'Quantity is required', min: 1 })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Unit</label>
              <select
                {...register('unit')}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              >
                <option value="servings">servings / meals</option>
                <option value="kg">kilograms (kg)</option>
                <option value="packets">packets / boxes</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Pickup Address</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                loading={locating}
                className="gap-1.5 text-xs py-1 px-3"
              >
                <FiNavigation className="h-3.5 w-3.5" />
                <span>Use Current Location</span>
              </Button>
            </div>
            <input
              {...register('pickupAddress')}
              placeholder="e.g. Community Kitchen #4, Connaught Place"
              className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Latitude</label>
              <input
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Longitude</label>
              <input
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <FiMapPin className="h-4 w-4 text-[#428475]" />
              <span>Pickup Location Map (Click map to adjust pin)</span>
            </label>
            <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
              <LeafletMap
                key={`donate-food-map-${lat}-${lng}`}
                center={[lat, lng]}
                markers={[{ id: 'pickup-loc', type: 'donation', position: [lat, lng], foodName: foodNameVal || 'Pickup Location', quantity: quantityVal }]}
                onLocationSelect={handleLocationSelect}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Food Description & Handling Notes</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Freshly prepared at 2 PM. Packed in hygienic food-grade containers..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-medium text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5 text-[#428475]" />
                <span>Cooked / Prepared Time *</span>
              </label>
              <input
                type="datetime-local"
                {...register('cookedTime', { required: 'Cooked time is required' })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
              {errors.cookedTime && <p className="mt-1 text-xs font-semibold text-red-600">{errors.cookedTime.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5 text-red-600" />
                <span>Best Before / Expiry Time *</span>
              </label>
              <input
                type="datetime-local"
                {...register('expiryTime', { required: 'Expiry time is required' })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
              />
              {errors.expiryTime && <p className="mt-1 text-xs font-semibold text-red-600">{errors.expiryTime.message}</p>}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-dashed border-[#89D7B7] bg-[#FFF4E1]/30">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <FiUpload className="h-4 w-4 text-[#428475]" />
              <span>Food Image Upload (Optional)</span>
            </label>
            <input ref={fileRef} type="file" accept="image/*" className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#428475] file:text-white hover:file:bg-[#1A312C]" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={submitting} className="px-8 py-3 text-sm">
              Post Food Donation
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/donor/my-donations')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default DonateFood;
