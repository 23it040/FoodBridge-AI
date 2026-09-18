import { useEffect, useState, useCallback } from 'react';
import ngoService from '../../services/ngo.service';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import NGOMap from '../maps/NGOMap';
import useGeolocation from '../../hooks/useGeolocation';
import toast from 'react-hot-toast';
import {
  FiMapPin,
  FiCompass,
  FiPhone,
  FiGlobe,
  FiNavigation,
  FiExternalLink,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';

const NearbyNgosSection = () => {
  const { location: userLocation, loading: locating, errorMessage: locationError, requestLocation } = useGeolocation(true);

  const [radiusKm, setRadiusKm] = useState(10);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNearbyNgos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lat = userLocation?.lat;
      const lng = userLocation?.lng;
      const params = { radius: radiusKm * 1000 };
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }
      const res = await ngoService.getNgosForMap(params);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setNgos(list);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch nearby NGOs at this time.');
      setNgos([]);
    } finally {
      setLoading(false);
    }
  }, [userLocation, radiusKm]);

  useEffect(() => {
    fetchNearbyNgos();
  }, [fetchNearbyNgos]);

  const handleDetectLocation = () => {
    requestLocation()
      .then(() => toast.success('Location updated successfully!'))
      .catch((err) => toast.error(err.message || 'Location access denied.'));
  };

  return (
    <section className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F6F0] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2F8F72] border border-[#79D6B2] mb-2">
            <FiCompass className="h-3.5 w-3.5" />
            <span>FoodBridge Verified Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102A2A]">
            Nearby Verified Non-Profit NGOs & Food Banks
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#687370] mt-1">
            Discover verified food banks, social facilities, and community relief partners near your live position
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleDetectLocation}
            loading={locating}
            variant="outline"
            className="gap-2 text-xs py-2 px-4"
          >
            <FiMapPin className="h-4 w-4 text-[#2F8F72]" />
            <span>Detect My Location</span>
          </Button>

          <Button
            onClick={fetchNearbyNgos}
            loading={loading}
            className="gap-2 text-xs py-2 px-4"
          >
            <FiRefreshCw className="h-3.5 w-3.5" />
            <span>Refresh NGOs</span>
          </Button>
        </div>
      </div>

      {/* Permission Denied / Location Controls Banner */}
      {locationError && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-medium">
          <FiAlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-extrabold block">Location Access Information</strong>
            <span>{locationError} Displaying verified partner network locations.</span>
          </div>
        </div>
      )}

      {/* Radius Filter Toolbar */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#687370]">Search Radius:</label>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="rounded-xl border border-[#DDE5E1] bg-[#F6F7F4] px-3 py-1.5 text-xs font-bold text-[#102A2A] outline-none focus:border-[#2F8F72]"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
          <span className="text-xs font-semibold text-[#687370]">
            {ngos.length} Verified Partner(s) Available
          </span>
        </div>
      </Card>

      {/* Interactive Google Map */}
      <div id="home-ngo-map-container" className="overflow-hidden rounded-3xl border border-[#DDE5E1]">
        <NGOMap
          pickupLocation={userLocation}
          initialNgos={ngos}
          className="h-[440px]"
        />
      </div>

      {/* Nearby NGO Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center"><Spinner size={36} /></div>
        ) : error ? (
          <EmptyState title="API Connection Error" description={error} action={<Button onClick={fetchNearbyNgos}>Retry</Button>} />
        ) : ngos.length === 0 ? (
          <EmptyState
            title="No Nearby NGOs Found"
            description={`No verified non-profit partners found within ${radiusKm} km. Try expanding your search radius above.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ngos.map((ngo) => {
              const gMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ngo.latitude},${ngo.longitude}`;
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}`;

              return (
                <div
                  key={ngo.id || ngo._id}
                  className="rounded-[24px] bg-white p-5 border border-[#DDE5E1] shadow-card hover:shadow-elevated transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-extrabold text-[#102A2A] leading-snug">{ngo.organizationName || ngo.name}</h4>
                      {ngo.capacity && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          Cap: {ngo.capacity} meals
                        </Badge>
                      )}
                    </div>

                    {ngo.address && (
                      <p className="text-xs text-[#687370] flex items-start gap-1.5">
                        <FiMapPin className="h-3.5 w-3.5 text-[#2F8F72] shrink-0 mt-0.5" />
                        <span>{ngo.address}</span>
                      </p>
                    )}

                    {ngo.phone && (
                      <p className="text-xs text-[#2F8F72] font-medium flex items-center gap-1.5">
                        <FiPhone className="h-3.5 w-3.5 shrink-0" />
                        <span>{ngo.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#DDE5E1] flex items-center justify-between gap-2">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#102A2A] hover:bg-[#2F8F72] px-3.5 py-1.5 rounded-full transition"
                    >
                      <FiNavigation className="h-3.5 w-3.5" />
                      <span>Directions</span>
                    </a>

                    <a
                      href={gMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full border border-[#DDE5E1] text-[#687370] hover:border-[#79D6B2] hover:bg-[#E8F6F0] transition"
                      title="Open in Google Maps"
                    >
                      <FiExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyNgosSection;
