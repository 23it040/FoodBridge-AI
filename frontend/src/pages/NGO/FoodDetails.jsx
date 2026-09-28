import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import donationService from '../../services/donation.service';
import requestService from '../../services/request.service';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { getFoodImageUrl } from '../../utils/image';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import GoogleMap from '../../components/maps/GoogleMap';
import DonorMarker from '../../components/maps/DonorMarker';
import { normalizeCoordinates, getDirectionsUrl } from '../../services/map.service';
import toast from 'react-hot-toast';
import { FiBox, FiMapPin, FiCalendar, FiSend, FiUser, FiPhone, FiTruck, FiImage, FiNavigation } from 'react-icons/fi';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentLocation } = useLocationContext();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
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

  const loadDonation = async () => {
    if (!id) {
      setError('Invalid food donation ID.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const d = await donationService.getDonation(id);
      setDonation(d);
    } catch (err) {
      console.error('Failed to fetch donation details:', err);
      if (err.response?.status === 400) {
        setError('Invalid food donation ID.');
      } else if (err.response?.status === 401) {
        setError('Please log in again to view this donation.');
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view this donation.');
      } else if (err.response?.status === 404) {
        setError('Food donation not found.');
      } else if (err.response?.status === 500) {
        setError('Unable to load food donation due to server error.');
      } else {
        setError('Unable to connect to the server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonation();
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
  if (error) return <EmptyState title="Error Loading Item" description={error} action={<Button onClick={loadDonation}>Retry</Button>} />;
  if (!donation) return <EmptyState title="Food Donation Not Found" description="The requested food donation item could not be found." />;

  const donorCoords = normalizeCoordinates(donation);
  const isExpired = donation.status === 'EXPIRED' || (donation.expiryTime && new Date(donation.expiryTime) <= new Date());

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title={donation.foodName || donation.name || 'Food Donation Details'}
        subtitle={`Donated by ${donation.donorName || donation.donorId?.name || 'Verified Food Donor'}`}
        backPath="/ngo/nearby-food"
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
                  <Badge variant={isExpired ? 'danger' : 'success'}>
                    {isExpired ? 'EXPIRED' : (donation.status || 'AVAILABLE')}
                  </Badge>
                </div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider block">Quantity Available</span> <span className="text-base font-extrabold text-[#428475]">{donation.quantity} {donation.unit || 'servings'}</span></div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider block">Expiry Date / Time</span> <span className={isExpired ? "text-red-600 font-bold" : "text-amber-700 font-bold"}>{donation.expiryTime ? new Date(donation.expiryTime).toLocaleString() : 'Within 24 Hours'}</span></div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider block">Pickup Address</span> <span className="font-semibold text-slate-800">{donation.pickupAddress || 'Address specified upon request'}</span></div>
                <div className="pt-3 border-t border-slate-100 text-slate-600 leading-relaxed">{donation.description || 'No additional description provided.'}</div>
              </div>
            </div>
          </Card>

          <Card title="Pickup Location Map" icon={<FiMapPin className="h-5 w-5 text-[#428475]" />}>
            <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
              {donorCoords ? (
                <div>
                  <GoogleMap
                    key={`food-details-map-${id}`}
                    center={donorCoords}
                    zoom={13}
                    className="h-[340px]"
                  >
                    {/* Donor's actual pickup location */}
                    <DonorMarker
                      location={donorCoords}
                      variant="food"
                      title={`Donor Pickup: ${donation.foodName || donation.name || 'Food Item'}`}
                    />

                    {/* NGO's current location */}
                    {currentLocation && (
                      <DonorMarker
                        location={currentLocation}
                        variant="current"
                        title="Your Current Location"
                      />
                    )}
                  </GoogleMap>

                  {currentLocation && (
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">Navigate to pickup location:</span>
                      <a
                        href={getDirectionsUrl(currentLocation, donorCoords)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#428475] hover:bg-[#346a5e] text-white rounded-lg text-xs font-bold transition"
                      >
                        <FiNavigation className="h-3.5 w-3.5" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-xs font-semibold text-slate-500">
                  Donor pickup coordinates are not available for this donation.
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          {isExpired ? (
            <Card title="Pickup Request Unavailable" icon={<FiSend className="h-5 w-5 text-slate-400" />}>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
                <div className="text-amber-800 font-extrabold text-sm uppercase">Food Donation Expired</div>
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                  This food donation has passed its expiry time and is no longer available for pickup requests.
                </p>
                <Button disabled className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed">
                  Food Donation Expired
                </Button>
              </div>
            </Card>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
