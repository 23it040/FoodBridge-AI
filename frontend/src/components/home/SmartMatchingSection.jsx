import { motion } from 'framer-motion';
import { FiBox, FiArrowRight, FiShield, FiNavigation } from 'react-icons/fi';

const SmartMatchingSection = () => {
  return (
    <section className="py-20 bg-[#0D2222] text-white border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel p-8 sm:p-12 shadow-2xl border border-white/15 relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#79D6B2]">
              <span>INTELLIGENT LOGISTICS WORKFLOW</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Connecting Surplus Food with Verified NGOs
            </h2>
            <p className="text-sm font-medium text-[#D7E0DC]">
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
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D7E0DC]">FOOD DONATION</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#79D6B2]/20 text-[#79D6B2]">
                  <FiBox className="h-4 w-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white">Surplus Food Listing</h4>
              <div className="space-y-1.5 text-xs text-[#D7E0DC]">
                <p>• Quantity: <strong className="text-white">Specified Servings</strong></p>
                <p>• Location: <strong className="text-white">GeoJSON Pickup Point</strong></p>
                <p>• Category: <strong className="text-white">Selected Food Type</strong></p>
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#79D6B2]/20 border border-[#79D6B2]/40 text-[#79D6B2] shadow-2xl animate-pulse">
                <FiNavigation className="h-7 w-7" />
              </div>
              <span className="text-xs font-black text-[#79D6B2] tracking-wider">REAL-TIME MATCHING</span>
              <p className="text-[11px] text-[#D7E0DC]/80">Proximity & capacity verification</p>
              <div className="hidden md:flex items-center gap-1 text-[#79D6B2]">
                <FiArrowRight className="h-5 w-5 animate-pulse" />
              </div>
            </motion.div>

            {/* Step C: Verified NGO */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl border border-[#79D6B2]/50 bg-[#79D6B2]/10 p-6 text-left space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#79D6B2]">VERIFIED NGO PARTNER</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#79D6B2] text-[#102A2A]">
                  <FiShield className="h-4 w-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white">Verified Non-Profit Partner</h4>
              <div className="space-y-1.5 text-xs text-[#D7E0DC]">
                <p>• Status: <strong className="text-[#79D6B2]">Active & Verified</strong></p>
                <p>• Proximity: <strong className="text-white">Calculated Distance</strong></p>
                <p>• Verification: <strong className="text-[#79D6B2]">VERIFIED NGO</strong></p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartMatchingSection;
