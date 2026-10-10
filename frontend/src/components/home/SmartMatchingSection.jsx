import { motion } from 'framer-motion';
import { FiBox, FiArrowRight, FiShield, FiNavigation } from 'react-icons/fi';

const SmartMatchingSection = () => {
  return (
    <section className="py-24 bg-[#FAF7F2] border-b border-[#E5DED7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-8 sm:p-12 shadow-xl border border-[#E5DED7] relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E2EBE5] border border-[#E5DED7] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#7D9588]">
              <span>INTELLIGENT LOGISTICS WORKFLOW</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#2E302D] sm:text-4xl">
              Connecting Surplus Food with Verified NGOs
            </h2>
            <p className="text-sm font-normal text-[#73756F]">
              FoodBridge pairs donor listings with nearby verified non-profit partners based on location, category, and capacity.
            </p>
          </div>

          {/* Workflow Pipeline Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Step A: Donation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-[#E5DED7] bg-[#FAF7F2] p-6 text-left space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#73756F]">FOOD DONATION</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1DED7] text-[#B86F5B]">
                  <FiBox className="h-4 w-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-[#2E302D]">Surplus Food Listing</h4>
              <div className="space-y-1.5 text-xs text-[#73756F]">
                <p>• Quantity: <strong className="text-[#2E302D]">Specified Servings</strong></p>
                <p>• Location: <strong className="text-[#2E302D]">GeoJSON Pickup Point</strong></p>
                <p>• Category: <strong className="text-[#2E302D]">Selected Food Type</strong></p>
              </div>
            </motion.div>

            {/* Step B: Routing/Matching Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center justify-center p-4 text-center space-y-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E2EBE5] border border-[#E5DED7] text-[#7D9588] shadow-md animate-pulse">
                <FiNavigation className="h-7 w-7" />
              </div>
              <span className="text-xs font-black text-[#B86F5B] tracking-wider">REAL-TIME MATCHING</span>
              <p className="text-[11px] text-[#73756F]">Proximity & capacity verification</p>
              <div className="hidden md:flex items-center gap-1 text-[#B86F5B]">
                <FiArrowRight className="h-4 w-4" />
              </div>
            </motion.div>

            {/* Step C: Verified NGO Destination */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl border border-[#E5DED7] bg-[#FAF7F2] p-6 text-left space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#73756F]">VERIFIED DESTINATION</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E2EBE5] text-[#7D9588]">
                  <FiShield className="h-4 w-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-[#2E302D]">NGO Pickup Claim</h4>
              <div className="space-y-1.5 text-xs text-[#73756F]">
                <p>• Status: <strong className="text-[#6F987C]">ACCEPTED / CLAIMED</strong></p>
                <p>• Verification: <strong className="text-[#2E302D]">Admin Approved NGO</strong></p>
                <p>• Impact: <strong className="text-[#2E302D]">Direct Beneficiary Meal</strong></p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartMatchingSection;
