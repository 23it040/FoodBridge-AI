import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import donationService from '../../services/donation.service';
import ngoService from '../../services/ngo.service';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';
import { normalizeCoordinates } from '../../services/map.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import GoogleMap from '../../components/maps/GoogleMap';
import PickupMarker from '../../components/maps/PickupMarker';
import DonorMarker from '../../components/maps/DonorMarker';
import NGOMarker from '../../components/maps/NGOMarker';
import { useLocationContext } from '../../context/LocationContext';
import { discoverNearbyNGOs } from '../../services/ngoDiscovery.service';
import { FiBox, FiMapPin, FiCalendar, FiUpload, FiNavigation, FiX } from 'react-icons/fi';

const NEUTRAL_CENTER = { lat: 22.6005, lng: 72.8205 }; // Neutral fallback map center

const DonateFood = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    currentLocation: deviceLocation,
    locationLoading: locating,
    requestCurrentLocation
  } = useLocationContext();

  const nowISO = new Date().toISOString().slice(0, 16);
  const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const initialCoords = useMemo(() => {
    if (deviceLocation) return deviceLocation;
    if (user) {
      const norm = normalizeCoordinates(user);
      if (norm) return norm;
    }
    return NEUTRAL_CENTER;
  }, [user, deviceLocation]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      category: 'Cooked Meals',
      mealType: 'Cooked',
      quantity: 10,
      unit: 'servings',
      pickupAddress: user?.address || '',
      latitude: initialCoords.lat,
      longitude: initialCoords.lng,
      description: '',
      cookedTime: nowISO,
      expiryTime: defaultExpiry
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [nearbyNgos, setNearbyNgos] = useState([]);
  const fileRef = useRef(null);

  const latValue = watch('latitude');
  const lngValue = watch('longitude');

  const validPickupLocation = useMemo(() => {
    const latNum = Number(latValue);
    const lngNum = Number(lngValue);
    if (isNaN(latNum) || isNaN(lngNum)) return null;
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) return null;
    if (latNum === 0 && lngNum === 0) return null;
    return { lat: latNum, lng: lngNum };
  }, [latValue, lngValue]);

  useEffect(() => {
    let mounted = true;
    const targetLoc = validPickupLocation || initialCoords;
    if (targetLoc && targetLoc.lat && targetLoc.lng) {
      discoverNearbyNGOs({ location: targetLoc, radiusMeters: 20000 })
        .then((res) => {
          if (!mounted) return;
          setNearbyNgos(res.ngos || []);
        })
        .catch((err) => console.warn('Failed to load nearby NGOs for donation map:', err));
    }
    return () => {
      mounted = false;
    };
  }, [validPickupLocation, initialCoords]);

  const updateCoordinates = useCallback((lat, lng) => {
    const latNum = Number(Number(lat).toFixed(6));
    const lngNum = Number(Number(lng).toFixed(6));
    if (isNaN(latNum) || isNaN(lngNum)) return;
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) return;

    setValue('latitude', latNum, { shouldValidate: true, shouldDirty: true });
    setValue('longitude', lngNum, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleMapClick = useCallback((e) => {
    let clickLat, clickLng;
    if (e.detail?.latLng) {
      clickLat = e.detail.latLng.lat;
      clickLng = e.detail.latLng.lng;
    } else if (e.latLng) {
      clickLat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
      clickLng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
    }

    if (typeof clickLat === 'number' && typeof clickLng === 'number' && !isNaN(clickLat) && !isNaN(clickLng)) {
      updateCoordinates(clickLat, clickLng);
    }
  }, [updateCoordinates]);

  const handleMarkerDragEnd = useCallback((newPos) => {
    if (newPos && typeof newPos.lat === 'number' && typeof newPos.lng === 'number') {
      updateCoordinates(newPos.lat, newPos.lng);
    }
  }, [updateCoordinates]);

  const handleUseCurrentLocation = async () => {
    try {
      const pos = await requestCurrentLocation();
      if (pos && typeof pos.lat === 'number' && typeof pos.lng === 'number') {
        updateCoordinates(pos.lat, pos.lng);
        toast.success('Pickup location updated to current GPS position!');
      }
    } catch (err) {
      toast.error(err?.message || 'Unable to fetch current GPS location.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      setImageError('Food image is required.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setSelectedImage(null);
      setImagePreview(null);
      setImageError('Please upload a valid food image (JPG, PNG, WebP).');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      setSelectedImage(null);
      setImagePreview(null);
      setImageError('Image size must be 2 MB or less.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setSelectedImage(file);
    setImageError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('Food image is required.');
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const onSubmit = async (values) => {
    const file = selectedImage || fileRef.current?.files?.[0];
    if (!file) {
      setImageError('Food image is required.');
      return;
    }

    if (imageError) return;

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
      payload.append('latitude', String(values.latitude ?? DEFAULT_CENTER.lat));
      payload.append('longitude', String(values.longitude ?? DEFAULT_CENTER.lng));
      payload.append('foodImage', file);

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
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
              />
              {errors.name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Category</label>
              <select
                {...register('category')}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Meal Type</label>
              <select
                {...register('mealType')}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Quantity *</label>
              <input
                type="number"
                min={1}
                {...register('quantity', {
                  required: 'Quantity is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Quantity must be at least 1' }
                })}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Unit</label>
              <select
                {...register('unit')}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
              >
                <option value="servings">servings / meals</option>
                <option value="kg">kilograms (kg)</option>
                <option value="packets">packets / boxes</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Pickup Address</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                loading={locating}
                className="gap-1.5 text-xs py-1 px-3"
              >
                <FiNavigation className="h-3.5 w-3.5 text-[#BD715C]" />
                <span>Use Current Location</span>
              </Button>
            </div>
            <input
              {...register('pickupAddress', { required: 'Pickup address is required' })}
              placeholder="e.g. Community Kitchen #4, Connaught Place"
              className="w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
            />
            {errors.pickupAddress && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.pickupAddress.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Latitude</label>
              <input
                type="number"
                step="any"
                {...register('latitude', {
                  valueAsNumber: true,
                  min: { value: -90, message: 'Latitude must be between -90 and 90' },
                  max: { value: 90, message: 'Latitude must be between -90 and 90' }
                })}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
              />
              {errors.latitude && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.latitude.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Longitude</label>
              <input
                type="number"
                step="any"
                {...register('longitude', {
                  valueAsNumber: true,
                  min: { value: -180, message: 'Longitude must be between -180 and 180' },
                  max: { value: 180, message: 'Longitude must be between -180 and 180' }
                })}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
              />
              {errors.longitude && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.longitude.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760] flex items-center gap-1.5">
                <FiMapPin className="h-4 w-4 text-[#BD715C]" />
                <span>Pickup Location Map (Click map to adjust pin)</span>
              </label>

              {/* Marker Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#626760]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-600 shadow-xs" />
                  <span>Pickup Location (Draggable)</span>
                </div>
                {deviceLocation && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-xs" />
                    <span>Your Location</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
                  <span>Verified NGO</span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E6DED6]">
              <GoogleMap
                center={validPickupLocation || NEUTRAL_CENTER}
                zoom={14}
                onClick={handleMapClick}
                className="h-[380px]"
              >
                {/* Red Draggable Pickup Marker */}
                {validPickupLocation && (
                  <PickupMarker
                    location={validPickupLocation}
                    onDragEnd={handleMarkerDragEnd}
                    title="Pickup Location (Click map or drag pin to adjust)"
                  />
                )}

                {/* Blue Current Location Marker */}
                {deviceLocation && (
                  <DonorMarker
                    location={deviceLocation}
                    title="Your Current Location"
                    variant="current"
                  />
                )}

                {/* Green Verified NGO Markers */}
                {nearbyNgos.map((ngo) => (
                  <NGOMarker key={ngo.id || ngo._id} ngo={ngo} />
                ))}
              </GoogleMap>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Food Description & Handling Notes</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Freshly prepared at 2 PM. Packed in hygienic food-grade containers..."
              className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-medium text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760] flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5 text-[#BD715C]" />
                <span>Cooked / Prepared Time *</span>
              </label>
              <input
                type="datetime-local"
                {...register('cookedTime', { required: 'Cooked time is required' })}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
              />
              {errors.cookedTime && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.cookedTime.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760] flex items-center gap-1">
                <FiCalendar className="h-3.5 w-3.5 text-rose-600" />
                <span>Best Before / Expiry Time *</span>
              </label>
              <input
                type="datetime-local"
                {...register('expiryTime', {
                  required: 'Expiry time is required',
                  validate: (value, values) => new Date(value) > new Date(values.cookedTime) || 'Expiry must be after cooked time'
                })}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
              />
              {errors.expiryTime && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.expiryTime.message}</p>}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-dashed border-[#E6DED6] bg-[#FAF7F2]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#626760] mb-1 flex items-center gap-1.5">
              <FiUpload className="h-4 w-4 text-[#BD715C]" />
              <span>FOOD IMAGE UPLOAD *</span>
            </label>
            <p className="text-[11px] font-medium text-[#626760] mb-2">Upload a clear photo of the food.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleImageChange}
              className="text-xs text-[#626760] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#BD715C] file:text-white hover:file:bg-[#A85F4D] file:transition-colors file:cursor-pointer"
            />
            {imageError && <p className="mt-1.5 text-xs font-semibold text-red-600">{imageError}</p>}
            {imagePreview && (
              <div className="mt-3 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="h-28 w-28 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                  title="Remove image"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
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
