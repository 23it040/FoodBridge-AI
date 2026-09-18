import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import donationService from '../../services/donation.service';
import Spinner from '../ui/Spinner';
import { FiBox, FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';

const AvailableFoodSection = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDonations = async () => {
      try {
        const list = await donationService.listDonations({ limit: 6 });
        setDonations(Array.isArray(list) ? list.slice(0, 6) : []);
      } catch (err) {
        console.warn('Food donations load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDonations();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center bg-[#102A2A]">
        <Spinner />
      </div>
    );
  }

  if (donations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#102A2A] text-white border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#79D6B2] mb-3">
              <span>LIVE SURPLUS LISTINGS</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Available Food Nearby
            </h2>
            <p className="text-sm font-medium text-[#D7E0DC] mt-1">
              Surplus food listings available for verified NGO pickup requests.
            </p>
          </div>
          <Link to="/auth/login">
            <button className="glass-btn-secondary px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2">
              <span>View All Listings</span>
              <FiArrowRight className="h-3.5 w-3.5 text-[#79D6B2]" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donations.map((item, idx) => {
            const imgUrl = item.imageUrl || item.foodImage?.url;
            return (
              <motion.div
                key={item._id || item.id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group rounded-3xl glass-panel overflow-hidden shadow-2xl transition-all duration-300 hover:border-[#79D6B2]/50 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="h-48 w-full bg-[#0A1A1A] relative overflow-hidden flex items-center justify-center border-b border-white/10">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.foodName || 'Food donation'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-[#D7E0DC]/60">
                        <FiBox className="h-9 w-9 text-[#79D6B2]" />
                        <span className="text-xs font-semibold">Surplus Food Donation</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 rounded-full glass-pill px-3 py-1 text-[11px] font-bold text-[#79D6B2] shadow-lg">
                      {item.category || 'Cooked Meals'}
                    </div>
                  </div>

                  {/* Content details */}
                  <div className="p-6 space-y-3.5">
                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-[#79D6B2] transition-colors">
                      {item.foodName || item.name}
                    </h3>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="inline-flex items-center gap-1.5 bg-[#79D6B2]/15 border border-[#79D6B2]/30 text-[#79D6B2] px-3 py-1 rounded-full">
                        <FiBox className="h-3.5 w-3.5" />
                        <span>{item.quantity} {item.unit || 'servings'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#D7E0DC]">
                        <FiClock className="h-3.5 w-3.5 text-[#79D6B2]" />
                        <span>Best before: {item.expiryTime}</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-[#D7E0DC] pt-1">
                      <FiMapPin className="h-3.5 w-3.5 text-[#79D6B2] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item.pickupAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-[#79D6B2] tracking-wider">
                    {item.status || 'AVAILABLE'}
                  </span>
                  <Link to="/auth/login">
                    <button className="glass-btn-primary text-xs px-4 py-1.5 rounded-full font-semibold">
                      Request Pickup
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AvailableFoodSection;
