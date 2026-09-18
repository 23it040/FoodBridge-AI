import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ngoService from '../../services/ngo.service';
import NGOMap from '../maps/NGOMap';
import Spinner from '../ui/Spinner';
import { FiMapPin, FiPhone, FiCheckCircle } from 'react-icons/fi';

const DEFAULT_LAT = 21.1702; // Surat
const DEFAULT_LNG = 72.8311;

const LiveMapSection = () => {
  const [userLocation, setUserLocation] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeNgoId, setActiveNgoId] = useState(null);

  const fetchNgos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ngoService.getNgosForMap({ includeDemo: true });
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setNgos(list);
    } catch (err) {
      console.warn('Live map NGO fetch error:', err);
      setNgos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { timeout: 8000 }
      );
    }
    fetchNgos();
  }, [fetchNgos]);

  return (
    <section id="live-discovery" className="py-20 bg-[#0D2222] text-white border-b border-white/10 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#79D6B2] mb-3">
              <span className="h-2 w-2 rounded-full bg-[#79D6B2] animate-pulse" />
              <span>GEOGRAPHIC DISCOVERY</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Discover Nearby Food & Partners
            </h2>
            <p className="text-sm font-medium text-[#D7E0DC] mt-1">
              Interactive map tracking verified NGO partners and surplus food pickup points in real time.
            </p>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT: Google Map in Dark Container */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl h-[480px] sm:h-[520px] relative">
              <NGOMap
                pickupLocation={userLocation}
                initialNgos={ngos.length ? ngos : null}
                className="h-[480px] sm:h-[520px]"
              />
            </div>
          </div>

          {/* RIGHT: Logistics NGO Cards */}
          <div className="lg:col-span-5 flex flex-col space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 glass-panel">
                <Spinner />
              </div>
            ) : ngos.length === 0 ? (
              <div className="rounded-3xl border border-white/10 glass-panel p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#79D6B2]/20 text-[#79D6B2]">
                  <FiMapPin className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">No Registered NGOs Found</h4>
                <p className="text-xs text-[#D7E0DC]">
                  Our platform network is growing rapidly. Register as a donor or NGO partner to expand local coverage.
                </p>
              </div>
            ) : (
              ngos.map((ngo, idx) => {
                const ngoId = ngo.id || ngo._id || `ngo-${idx}`;
                return (
                  <motion.div
                    key={ngoId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    onClick={() => setActiveNgoId(ngoId)}
                    className={`rounded-2xl border p-4.5 transition-all duration-300 cursor-pointer glass-panel ${
                      activeNgoId === ngoId
                        ? 'border-[#79D6B2] shadow-2xl ring-2 ring-[#79D6B2]/30 bg-white/10'
                        : 'border-white/10 hover:border-[#79D6B2]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="inline-flex items-center gap-1 rounded-full bg-[#79D6B2]/20 border border-[#79D6B2]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#79D6B2] mb-1">
                          <FiCheckCircle className="h-3 w-3" />
                          <span>VERIFIED NGO</span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {ngo.organizationName || ngo.name || 'Community Partner NGO'}
                        </h4>
                      </div>
                      {ngo.capacity && (
                        <span className="text-xs font-bold text-[#79D6B2] shrink-0 bg-[#79D6B2]/10 px-2 py-0.5 rounded-md">
                          Cap: {ngo.capacity}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#D7E0DC] line-clamp-2 mb-3">
                      {ngo.address || ngo.city || 'Verified community food redistribution partner'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-[#79D6B2] font-semibold text-[11px]">
                        Accepts: {Array.isArray(ngo.foodTypesAccepted) ? ngo.foodTypesAccepted.join(', ') : 'cooked, packaged'}
                      </span>
                      {ngo.phone && (
                        <span className="text-[#D7E0DC] flex items-center gap-1">
                          <FiPhone className="h-3 w-3 text-[#79D6B2]" />
                          <span>{ngo.phone}</span>
                        </span>
                      )}
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
