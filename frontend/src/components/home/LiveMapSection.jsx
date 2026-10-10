import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import NGOMap from '../maps/NGOMap';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { useLocationContext } from '../../context/LocationContext';
import { discoverNearbyNGOs } from '../../services/ngoDiscovery.service';
import { FiMapPin, FiPhone, FiCheckCircle, FiNavigation, FiExternalLink, FiCompass } from 'react-icons/fi';

const LiveMapSection = () => {
  const {
    currentLocation,
    locationLoading: locating,
    errorType: locationErrorType,
    errorMessage: locationError,
    requestCurrentLocation
  } = useLocationContext();

  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emptyNotice, setEmptyNotice] = useState(null);
  const [activeNgoId, setActiveNgoId] = useState(null);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchNgos = useCallback(async (location) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
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
    setEmptyNotice(null);

    try {
      const res = await discoverNearbyNGOs({
        location,
        radiusMeters: 10000,
        signal: abortControllerRef.current.signal
      });

      setNgos(res.ngos || []);
      setError(res.error);
      setEmptyNotice(res.emptyMessage);
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.warn('Live map NGO discovery error:', err);
        setError('Nearby NGO service temporarily unavailable.');
        setNgos([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchNgos(currentLocation);
    } else {
      setNgos([]);
      setLoading(false);
    }
  }, [fetchNgos, currentLocation]);

  const handleUseMyLocation = async () => {
    try {
      const location = await requestCurrentLocation();
      if (location) {
        await fetchNgos(location);
      }
    } catch (err) {
      console.warn('Location request rejected:', err.message);
    }
  };

  const handleCardClick = (ngo, ngoId) => {
    setActiveNgoId(ngoId);
    setSelectedNgo(ngo);
  };

  const locationMessage = !currentLocation
    ? locationErrorType === 'PERMISSION_DENIED'
      ? 'Location permission denied. Click "Use My Location" to enable.'
      : 'Allow location access to find verified NGOs and community kitchens near you.'
    : null;

  return (
    <section id="live-discovery" className="py-24 bg-[#FAF7F2] border-b border-[#E5DED7] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E2EBE5] border border-[#E5DED7] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#7D9588] mb-3">
              <span className="h-2 w-2 rounded-full bg-[#7D9588] animate-pulse" />
              <span>GEOGRAPHIC DISCOVERY</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#2E302D] sm:text-4xl">
              Discover Nearby Food & Partners
            </h2>
            <p className="text-sm font-normal text-[#73756F] mt-1">
              Interactive map tracking verified NGO partners and community organizations in real time around your location.
            </p>
          </div>

          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 bg-white border border-[#E5DED7] hover:bg-[#F1DED7] hover:border-[#B86F5B] text-[#2E302D] px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all"
          >
            <FiNavigation className="h-4 w-4 text-[#B86F5B]" />
            <span>{locating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT: Google Map in Light Container */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-[#E5DED7] bg-white shadow-lg h-[480px] sm:h-[520px] relative">
              <NGOMap
                pickupLocation={currentLocation}
                initialNgos={ngos}
                selectedNgo={selectedNgo}
                onSelectNgo={(ngo) => {
                  setSelectedNgo(ngo);
                  setActiveNgoId(ngo?.id || ngo?._id);
                }}
                className="h-[480px] sm:h-[520px]"
              />
              {locationMessage && (
                <div className="absolute left-3 top-3 z-10 rounded-xl border border-[#E5DED7] bg-white/95 px-3.5 py-2 text-xs font-medium text-[#2E302D] shadow-md backdrop-blur-md flex items-center gap-2">
                  <FiCompass className="h-4 w-4 text-[#B86F5B] shrink-0" />
                  <span>{locationMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Logistics NGO Cards */}
          <div className="lg:col-span-5 flex flex-col space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-[#E5DED7] bg-white p-6 shadow-sm">
                <Spinner />
                <span className="text-xs font-medium text-[#73756F]">Finding NGOs near your location...</span>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-[#E5DED7] bg-white p-8 text-center text-[#2E302D] space-y-3 shadow-sm">
                <h4 className="text-base font-bold text-[#B86F5B]">{error}</h4>
                <p className="text-xs text-[#73756F]">
                  Please check network connection or click below to retry.
                </p>
                <button
                  onClick={() => fetchNgos(currentLocation)}
                  className="bg-[#B86F5B] hover:bg-[#A85F4D] text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm"
                >
                  Retry Search
                </button>
              </div>
            ) : !currentLocation ? (
              <div className="rounded-3xl border border-[#E5DED7] bg-white p-8 text-center space-y-3 shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E2EBE5] text-[#7D9588]">
                  <FiCompass className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-[#2E302D]">Enable Location</h4>
                <p className="text-xs text-[#73756F]">
                  Allow location access in your browser or click "Use My Location" to discover non-profit organizations near you.
                </p>
                <button
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-2 bg-[#B86F5B] hover:bg-[#A85F4D] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm"
                >
                  <FiNavigation className="h-4 w-4" />
                  <span>Find NGOs Near Me</span>
                </button>
              </div>
            ) : ngos.length === 0 ? (
              <div className="rounded-3xl border border-[#E5DED7] bg-white p-8 text-center space-y-3 shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1DED7] text-[#B86F5B]">
                  <FiMapPin className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-[#2E302D]">
                  {emptyNotice || 'No nearby NGOs found within this radius.'}
                </h4>
                <p className="text-xs text-[#73756F]">
                  We couldn't find any registered NGOs or non-profit organizations within 10 km of your current location.
                </p>
              </div>
            ) : (
              ngos.map((ngo, idx) => {
                const ngoId = ngo.id || ngo._id || `ngo-${idx}`;
                const isSelected = activeNgoId === ngoId || selectedNgo?.id === ngoId || selectedNgo?._id === ngoId;
                const isFoodBridge = ngo.source === 'foodbridge';

                return (
                  <motion.div
                    key={ngoId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    onClick={() => handleCardClick(ngo, ngoId)}
                    className={`rounded-2xl border p-4.5 transition-all duration-300 cursor-pointer bg-white ${
                      isSelected
                        ? 'border-[#B86F5B] shadow-md ring-2 ring-[#B86F5B]/20 bg-[#F1DED7]/20'
                        : 'border-[#E5DED7] hover:border-[#B86F5B]/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        {isFoodBridge ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-[#E2EBE5] border border-[#E5DED7] px-2.5 py-0.5 text-[10px] font-extrabold text-[#7D9588] mb-1">
                            <FiCheckCircle className="h-3 w-3" />
                            <span>VERIFIED FOODBRIDGE NGO</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-full bg-[#EAF2F4] border border-[#E5DED7] px-2.5 py-0.5 text-[10px] font-extrabold text-[#7196A3] mb-1">
                            <span>NEARBY NGO</span>
                          </div>
                        )}
                        <h4 className="text-sm font-bold text-[#2E302D] line-clamp-1">
                          {ngo.organizationName || ngo.name || 'Community Organization'}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {ngo.capacity && (
                          <span className="text-xs font-bold text-[#7D9588] shrink-0 bg-[#E2EBE5] px-2 py-0.5 rounded-md">
                            Cap: {ngo.capacity}
                          </span>
                        )}
                        {ngo.distanceKm != null && (
                          <span className="text-[11px] font-semibold text-[#B86F5B] bg-[#F1DED7] px-2 py-0.5 rounded">
                            {ngo.distanceKm} km away
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#73756F] line-clamp-2 mb-3">
                      {ngo.address || ngo.city || 'Non-profit food assistance partner'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E5DED7] text-xs">
                      {isFoodBridge ? (
                        <span className="text-[#7D9588] font-semibold text-[11px]">
                          Accepts: {Array.isArray(ngo.foodTypesAccepted) ? ngo.foodTypesAccepted.join(', ') : 'cooked, packaged'}
                        </span>
                      ) : ngo.rating ? (
                        <span className="text-amber-600 font-semibold text-[11px]">
                          ★ {ngo.rating} {ngo.reviews ? `(${ngo.reviews} reviews)` : ''}
                        </span>
                      ) : (
                        <span className="text-[#73756F] font-medium text-[11px]">Community Partner</span>
                      )}

                      {ngo.phone ? (
                        <span className="text-[#2E302D] flex items-center gap-1 font-medium">
                          <FiPhone className="h-3 w-3 text-[#B86F5B]" />
                          <span>{ngo.phone}</span>
                        </span>
                      ) : ngo.googleMapsURI ? (
                        <a
                          href={ngo.googleMapsURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#B86F5B] hover:text-[#A85F4D] flex items-center gap-1 font-medium text-[11px]"
                        >
                          <span>Google Maps</span>
                          <FiExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveMapSection;
