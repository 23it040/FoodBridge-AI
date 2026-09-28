import { useEffect, useState, useCallback, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import NGOMap from '../maps/NGOMap';
import { useLocationContext } from '../../context/LocationContext';
import { discoverNearbyNGOs } from '../../services/ngoDiscovery.service';
import toast from 'react-hot-toast';
import {
  FiMapPin,
  FiCompass,
  FiPhone,
  FiGlobe,
  FiNavigation,
  FiExternalLink,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

const NearbyNgosSection = () => {
  const {
    currentLocation: userLocation,
    locationLoading: locating,
    errorMessage: locationError,
    requestCurrentLocation
  } = useLocationContext();

  const [radiusKm, setRadiusKm] = useState(10);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchNearbyNgos = useCallback(async () => {
    if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      setNgos([]);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setEmptyMessage(null);

    try {
      const res = await discoverNearbyNGOs({
        location: userLocation,
        radiusMeters: radiusKm * 1000,
        signal: abortControllerRef.current.signal
      });

      setNgos(res.ngos || []);
      setError(res.error);
      setEmptyMessage(res.emptyMessage);
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Nearby NGOs section error:', err);
        setError('Nearby NGO service temporarily unavailable.');
        setNgos([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userLocation, radiusKm]);

  useEffect(() => {
    fetchNearbyNgos();
  }, [fetchNearbyNgos]);

  const handleDetectLocation = () => {
    requestCurrentLocation()
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
            <span>FoodBridge Discovery Network</span>
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
      {!userLocation && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-medium">
          <FiAlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-extrabold block">Location Access Information</strong>
            <span>{locationError || 'Allow location access in your browser or click "Detect My Location" to find NGOs near you.'}</span>
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
            {ngos.length} Partner(s) Available
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
        ) : !userLocation ? (
          <EmptyState
            title="Location Permission Required"
            description="Please enable browser location access to discover NGOs and community food programs near you."
            action={<Button onClick={handleDetectLocation} loading={locating}>Use My Location</Button>}
          />
        ) : ngos.length === 0 ? (
          <EmptyState
            title="No Nearby NGOs Found"
            description={emptyMessage || `No non-profit partners found within ${radiusKm} km. Try expanding your search radius above.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ngos.map((ngo) => {
              const gMapsUrl = ngo.googleMapsURI || `https://www.google.com/maps/search/?api=1&query=${ngo.latitude},${ngo.longitude}`;
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}`;
              const isFoodBridge = ngo.source === 'foodbridge' || ngo.isVerified;

              return (
                <Card key={ngo.id || ngo._id} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      {isFoodBridge ? (
                        <Badge variant="success" className="gap-1 text-[10px]">
                          <FiCheckCircle className="h-3 w-3" />
                          VERIFIED FOODBRIDGE NGO
                        </Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
                          NEARBY NGO
                        </span>
                      )}
                      {ngo.distanceKm != null && (
                        <span className="text-xs font-bold text-[#2F8F72] bg-[#E8F6F0] px-2 py-0.5 rounded-full">
                          {ngo.distanceKm} km away
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-[#102A2A] line-clamp-1">
                        {ngo.organizationName || ngo.name}
                      </h3>
                      <p className="text-xs text-[#687370] mt-1 flex items-start gap-1 line-clamp-2">
                        <FiMapPin className="h-3.5 w-3.5 shrink-0 text-[#2F8F72] mt-0.5" />
                        <span>{ngo.address || 'Address on file'}</span>
                      </p>
                    </div>

                    {isFoodBridge ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Array.isArray(ngo.foodTypesAccepted) &&
                          ngo.foodTypesAccepted.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                    ) : ngo.rating ? (
                      <div className="text-xs text-amber-600 font-semibold">
                        ★ {ngo.rating} {ngo.reviews ? `(${ngo.reviews} reviews)` : ''}
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {ngo.phone ? (
                      <a
                        href={`tel:${ngo.phone}`}
                        className="text-slate-600 font-semibold hover:text-[#2F8F72] flex items-center gap-1"
                      >
                        <FiPhone className="h-3.5 w-3.5" />
                        <span>{ngo.phone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">Community Partner</span>
                    )}

                    <div className="flex items-center gap-3">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2F8F72] font-bold hover:underline flex items-center gap-1"
                      >
                        <FiNavigation className="h-3.5 w-3.5" />
                        <span>Directions</span>
                      </a>
                      <a
                        href={gMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-slate-800"
                        title="View on Google Maps"
                      >
                        <FiExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyNgosSection;
