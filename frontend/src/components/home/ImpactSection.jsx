import { motion } from 'framer-motion';
import { FiHeart, FiTrendingUp, FiShield, FiTruck } from 'react-icons/fi';

const ImpactSection = () => {
  return (
    <section id="impact" className="py-20 bg-[#102A2A] text-white border-b border-white/10 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#79D6B2]">
            <FiHeart className="h-3.5 w-3.5" />
            <span>SOCIAL IMPACT & REDISTRIBUTION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            EVERY DONATION <br />
            <span className="text-[#79D6B2]">HAS A DESTINATION.</span>
          </h2>
          <p className="text-sm font-medium text-[#D7E0DC] max-w-lg mx-auto">
            FoodBridge brings donors, NGOs, and pickup logistics into one connected, transparent workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl glass-panel p-7 space-y-4 hover:border-[#79D6B2]/50 transition-all duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#79D6B2]/20 border border-[#79D6B2]/30 text-[#79D6B2]">
              <FiShield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Organization Network</h3>
            <p className="text-xs text-[#D7E0DC] leading-relaxed">
              Every NGO partner undergoes admin verification to guarantee that food donations reach legitimate social causes and community kitchens.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl glass-panel p-7 space-y-4 hover:border-[#79D6B2]/50 transition-all duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#79D6B2]/20 border border-[#79D6B2]/30 text-[#79D6B2]">
              <FiTruck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Transparent Pickup Lifecycle</h3>
            <p className="text-xs text-[#D7E0DC] leading-relaxed">
              Clear status updates (`PENDING`, `ACCEPTED`, `REJECTED`) provide full accountability from initial posting to final beneficiary handover.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-3xl glass-panel p-7 space-y-4 hover:border-[#79D6B2]/50 transition-all duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#79D6B2]/20 border border-[#79D6B2]/30 text-[#79D6B2]">
              <FiTrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Environmental Sustainability</h3>
            <p className="text-xs text-[#D7E0DC] leading-relaxed">
              Diverting wholesome surplus food from landfills directly mitigates methane emissions and supports regional zero food waste goals.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
