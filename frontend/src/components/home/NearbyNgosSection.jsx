import { useEffect, useState, useRef, useCallback } from 'react';
import ngoService from '../../services/ngo.service';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import LeafletMap from '../maps/LeafletMap';
import toast from 'react-hot-toast';
import {
  FiMapPin,
  FiSearch,
  FiCompass,
  FiPhone,
  FiGlobe,
  FiNavigation,
  FiExternalLink,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';

const DEFAULT_LAT = 28.6139; // Default center (New Delhi)
const DEFAULT_LNG = 77.2090;

const NearbyNgosSection = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // Manual fallback inputs
  const [manualCity, setManualCity] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);

  // Data states
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map instance reference for smooth panning
  const mapControlRef = useRef(null);

  // Handle Geolocation API
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setLocationDenied(true);
      setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      return;
    }

    setLocating(true);
    setLocationDenied(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000
        };
        setUserLocation(coords);
        setLatInput(String(coords.lat));
        setLngInput(String(coords.lng));
        setLocating(false);
        toast.success('Location detected successfully!');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocating(false);
        setLocationDenied(true);
        // Default location fallback
        setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setLatInput(String(DEFAULT_LAT));
        setLngInput(String(DEFAULT_LNG));
        toast('Location access denied. Using fallback location.', { icon: '📍' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Fetch Nearby NGOs from Overpass API backend service
  const fetchNearbyNgos = useCallback(async () => {
    const lat = userLocation?.lat;
    const lng = userLocation?.lng;

    if (!lat || !lng) return;

    setLoading(true);
    setError(null);

    try {
      const radiusMeters = radiusKm * 1000;
      const res = await ngoService.getNearbyNgos(lat, lng, radiusMeters);
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
    if (userLocation) {
      fetchNearbyNgos();
    }
  }, [userLocation, fetchNearbyNgos]);

  // Handle manual city / lat-lng search
  const handleManualSearch = (e) => {
    e.preventDefault();
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(lngInput);

    if (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
      setUserLocation({ lat: parsedLat, lng: parsedLng });
      toast.success(`Search area set to coordinates (${parsedLat}, ${parsedLng})`);
    } else if (manualCity.trim()) {
      // Basic city mapping demo presets for popular hubs
      const cityLower = manualCity.toLowerCase().trim();
      let cityLat = DEFAULT_LAT;
      let cityLng = DEFAULT_LNG;

      if (cityLower.includes('mumbai')) { cityLat = 19.0760; cityLng = 72.8777; }
      else if (cityLower.includes('bengaluru') || cityLower.includes('bangalore')) { cityLat = 12.9716; cityLng = 77.5946; }
      else if (cityLower.includes('hyderabad')) { cityLat = 17.3850; cityLng = 78.4867; }
      else if (cityLower.includes('chennai')) { cityLat = 13.0827; cityLng = 80.2707; }
      else if (cityLower.includes('kolkata')) { cityLat = 22.5726; cityLng = 88.3639; }
      else if (cityLower.includes('york')) { cityLat = 40.7128; cityLng = -74.0060; }
      else if (cityLower.includes('london')) { cityLat = 51.5074; cityLng = -0.1278; }

      setUserLocation({ lat: cityLat, lng: cityLng });
      setLatInput(String(cityLat));
      setLngInput(String(cityLng));
      toast.success(`Search location set to ${manualCity}`);
    } else {
      toast.error('Please enter valid coordinates or city name.');
    }
  };

  // Build Leaflet map markers
  const mapMarkers = [
    ...ngos.map((ngo) => ({
      id: ngo.id,
      type: 'ngo',
      position: [ngo.latitude, ngo.longitude],
      ngoName: ngo.name,
      distance: ngo.distance,
      verificationStatus: 'OSM Nearby'
    }))
  ];

  const handleFocusNgoOnMap = (ngo) => {
    if (mapControlRef.current) {
      mapControlRef.current.focusMarker(ngo.id, [ngo.latitude, ngo.longitude]);
      // Smooth scroll to map container
      const mapEl = document.getElementById('home-ngo-map-container');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <section className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#89D7B7]/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#428475] border border-[#89D7B7] mb-2">
            <FiCompass className="h-3.5 w-3.5" />
            <span>OpenStreetMap & Overpass API</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A312C]">
            Nearby Non-Profit NGOs & Food Banks
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Discover verified food banks, social facilities, and community relief centers near your live position
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={detectLocation}
            loading={locating}
            variant="outline"
            className="gap-2 text-xs py-2 px-4"
          >
            <FiMapPin className="h-4 w-4 text-[#428475]" />
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
      {locationDenied && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-medium">
          <FiAlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-extrabold block">Location Access Permission Denied</strong>
            <span>Browser location access is restricted. Use the search bar below to manually specify your city or coordinates.</span>
          </div>
        </div>
      )}

      {/* Manual Search & Filters Toolbar */}
      <Card>
        <form onSubmit={handleManualSearch} className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                City / Region Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Delhi, Mumbai..."
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3.5 py-2 text-xs font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
                />
                <FiSearch className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Latitude Coordinates
              </label>
              <input
                type="number"
                step="any"
                placeholder="28.6139"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3.5 py-2 text-xs font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Longitude Coordinates
              </label>
              <input
                type="number"
                step="any"
                placeholder="77.2090"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-3.5 py-2 text-xs font-semibold text-[#1A312C] outline-none focus:border-[#428475]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto pt-2 lg:pt-0">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Radius:</label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-[#FFF4E1]/30 px-3 py-2 text-xs font-bold text-[#1A312C] outline-none focus:border-[#428475]"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            <Button type="submit" variant="secondary" className="text-xs px-5 py-2">
              Apply Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Interactive Leaflet Map */}
      <div id="home-ngo-map-container">
        {loading ? (
          <div className="h-[420px] w-full rounded-[24px] bg-[#89D7B7]/20 border border-[#89D7B7] animate-pulse flex items-center justify-center">
            <div className="text-center space-y-2">
              <Spinner size={40} />
              <p className="text-xs font-bold text-[#1A312C]">Querying OpenStreetMap Overpass API...</p>
            </div>
          </div>
        ) : (
          <LeafletMap
            center={userLocation ? [userLocation.lat, userLocation.lng] : [DEFAULT_LAT, DEFAULT_LNG]}
            userLocation={userLocation ? [userLocation.lat, userLocation.lng] : null}
            zoom={13}
            markers={mapMarkers}
            onMapCreated={(controller) => {
              mapControlRef.current = controller;
            }}
          />
        )}
      </div>

      {/* Nearby NGO Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#1A312C]">
            Discovered NGOs <span className="text-xs font-semibold text-[#428475]">({ngos.length} found)</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">Live Overpass Data</span>
        </div>

        {loading ? (
          <div className="py-8 text-center"><Spinner size={36} /></div>
        ) : error ? (
          <EmptyState title="API Connection Error" description={error} action={<Button onClick={fetchNearbyNgos}>Retry</Button>} />
        ) : ngos.length === 0 ? (
          <EmptyState
            title="No Nearby NGOs Found"
            description={`No non-profit centers found within ${radiusKm} km of coordinates (${userLocation?.lat}, ${userLocation?.lng}). Try expanding your search radius above.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ngos.map((ngo) => {
              const gMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ngo.latitude},${ngo.longitude}`;
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude},${ngo.longitude}`;

              return (
                <div
                  key={ngo.id}
                  className="rounded-[24px] bg-white p-5 border border-[#89D7B7] shadow-card hover:shadow-elevated transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-extrabold text-[#1A312C] leading-snug">{ngo.name}</h4>
                      {ngo.distance !== null && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {ngo.distance} km
                        </Badge>
                      )}
                    </div>

                    {ngo.address && (
                      <p className="text-xs text-slate-600 flex items-start gap-1.5">
                        <FiMapPin className="h-3.5 w-3.5 text-[#428475] shrink-0 mt-0.5" />
                        <span>{ngo.address}</span>
                      </p>
                    )}

                    {ngo.phone && (
                      <p className="text-xs text-[#428475] font-medium flex items-center gap-1.5">
                        <FiPhone className="h-3.5 w-3.5 shrink-0" />
                        <span>{ngo.phone}</span>
                      </p>
                    )}

                    {ngo.website && (
                      <p className="text-xs flex items-center gap-1.5">
                        <FiGlobe className="h-3.5 w-3.5 text-[#428475] shrink-0" />
                        <a
                          href={ngo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#428475] font-semibold underline hover:text-[#1A312C] truncate"
                        >
                          {ngo.website}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFocusNgoOnMap(ngo)}
                      className="gap-1 text-xs px-3 py-1.5 flex-1"
                    >
                      <FiMapPin className="h-3.5 w-3.5" />
                      <span>View on Map</span>
                    </Button>

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#1A312C] hover:bg-[#428475] px-3 py-1.5 rounded-full transition"
                    >
                      <FiNavigation className="h-3.5 w-3.5" />
                      <span>Directions</span>
                    </a>

                    <a
                      href={gMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full border border-slate-200 text-slate-600 hover:border-[#89D7B7] hover:bg-[#FFF4E1] transition"
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
