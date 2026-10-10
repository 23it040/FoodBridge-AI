import { motion } from 'framer-motion';
import { FiHeart, FiTrendingUp, FiShield, FiTruck } from 'react-icons/fi';

const ImpactSection = () => {
  return (
    <section id="impact" className="py-24 bg-[#FAF7F2] text-[#2E302D] border-b border-[#E5DED7] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E2EBE5] border border-[#E5DED7] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#7D9588]">
            <FiHeart className="h-3.5 w-3.5 text-[#B86F5B]" />
            <span>SOCIAL IMPACT & REDISTRIBUTION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#2E302D] leading-tight">
            EVERY DONATION <br />
            <span className="text-[#B86F5B]">HAS A DESTINATION.</span>
          </h2>
          <p className="text-sm font-normal text-[#73756F] max-w-lg mx-auto">
            FoodBridge brings donors, NGOs, and pickup logistics into one connected, transparent workflow.
          </p>
        </div>

        {/* 3 Impact Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-white border border-[#E5DED7] p-8 space-y-4 shadow-sm hover:shadow-md hover:border-[#B86F5B]/30 transition-all duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E2EBE5] text-[#7D9588]">
              <FiShield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2E302D]">Verified Organization Network</h3>
            <p className="text-xs text-[#73756F] leading-relaxed">
              Every NGO partner undergoes admin verification to guarantee that food donations reach legitimate social causes and community kitchens.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl bg-white border border-[#E5DED7] p-8 space-y-4 shadow-sm hover:shadow-md hover:border-[#B86F5B]/30 transition-all duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1DED7] text-[#B86F5B]">
              <FiTruck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2E302D]">Transparent Pickup Lifecycle</h3>
            <p className="text-xs text-[#73756F] leading-relaxed">
              Clear status updates (`PENDING`, `ACCEPTED`, `REJECTED`) provide full accountability from initial posting to final beneficiary handover.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-3xl bg-white border border-[#E5DED7] p-8 space-y-4 shadow-sm hover:shadow-md hover:border-[#B86F5B]/30 transition-all duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2F4] text-[#7196A3]">
              <FiTrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2E302D]">Environmental Sustainability</h3>
            <p className="text-xs text-[#73756F] leading-relaxed">
              Diverting wholesome surplus food from landfills directly mitigates methane emissions and supports regional zero food waste goals.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
