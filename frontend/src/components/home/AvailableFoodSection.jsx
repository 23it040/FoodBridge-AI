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
      <div className="py-16 text-center bg-[#FAF7F2]">
        <Spinner />
      </div>
    );
  }

  if (donations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#FAF7F2] text-[#292B29] border-b border-[#E6DED6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#BD715C] mb-3">
              <span>LIVE SURPLUS LISTINGS</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#292B29] sm:text-4xl">
              Available Food Nearby
            </h2>
            <p className="text-sm font-medium text-[#626760] mt-1">
              Surplus food listings available for verified NGO pickup requests.
            </p>
          </div>
          <Link to="/auth/login">
            <button className="glass-btn-secondary px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 text-[#292B29]">
              <span>View All Listings</span>
              <FiArrowRight className="h-3.5 w-3.5 text-[#BD715C]" />
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
                className="group rounded-3xl bg-white border border-[#E6DED6] overflow-hidden shadow-card transition-all duration-300 hover:border-[#BD715C]/50 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Image container */}
                  <div className="h-48 w-full bg-[#FAF7F2] relative overflow-hidden flex items-center justify-center border-b border-[#E6DED6]">
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
                      <div className="flex flex-col items-center gap-1.5 text-[#626760]">
                        <FiBox className="h-9 w-9 text-[#BD715C]" />
                        <span className="text-xs font-semibold">Surplus Food Donation</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#BD715C] border border-[#E6DED6] shadow-sm">
                      {item.category || 'Cooked Meals'}
                    </div>
                  </div>

                  {/* Content details */}
                  <div className="p-6 space-y-3.5">
                    <h3 className="text-lg font-bold text-[#292B29] line-clamp-1 group-hover:text-[#BD715C] transition-colors">
                      {item.foodName || item.name}
                    </h3>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="inline-flex items-center gap-1.5 bg-[#F3DED6] border border-[#BD715C]/30 text-[#BD715C] px-3 py-1 rounded-full">
                        <FiBox className="h-3.5 w-3.5" />
                        <span>{item.quantity} {item.unit || 'servings'}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#626760]">
                        <FiClock className="h-3.5 w-3.5 text-[#BD715C]" />
                        <span>Best before: {item.expiryTime}</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-[#626760] pt-1">
                      <FiMapPin className="h-3.5 w-3.5 text-[#BD715C] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item.pickupAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-[#FAF7F2]/60 border-t border-[#E6DED6] flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-[#BD715C] tracking-wider">
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
