import { motion } from 'framer-motion';
import { FiEdit3, FiSearch, FiCalendar, FiCheckSquare } from 'react-icons/fi';

const steps = [
  {
    num: '01',
    title: 'Donate Food',
    desc: 'Donors post extra food items with quantity, pickup location, and expiry window.',
    icon: <FiEdit3 className="h-5 w-5 text-[#79D6B2]" />
  },
  {
    num: '02',
    title: 'Find a Verified NGO',
    desc: 'Verified NGOs discover food listings on an interactive map matching capacity.',
    icon: <FiSearch className="h-5 w-5 text-[#79D6B2]" />
  },
  {
    num: '03',
    title: 'Schedule Pickup',
    desc: 'NGOs submit pickup requests with preferred time slots and beneficiary details.',
    icon: <FiCalendar className="h-5 w-5 text-[#79D6B2]" />
  },
  {
    num: '04',
    title: 'Complete Redistribution',
    desc: 'Donors accept requests and food is transferred safely to community centers.',
    icon: <FiCheckSquare className="h-5 w-5 text-[#79D6B2]" />
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-[#102A2A] text-white border-b border-white/10 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2F8F72]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#79D6B2]">
            <span>WORKFLOW LOGISTICS</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            From Surplus to Community
          </h2>
          <p className="text-sm font-medium text-[#D7E0DC] max-w-lg mx-auto">
            A seamless four-step redistribution process connecting food donors and verified NGOs in real time.
          </p>
        </div>

        {/* Horizontal Process Grid */}
        <div className="relative">
          {/* Thin connecting line for desktop */}
          <div className="hidden lg:block absolute top-14 left-20 right-20 h-0.5 bg-gradient-to-r from-transparent via-[#79D6B2]/40 to-transparent" />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step Glass Circle Container */}
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl glass-panel shadow-2xl transition-all duration-300 group-hover:border-[#79D6B2]/60 group-hover:scale-105">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#79D6B2]/15 border border-[#79D6B2]/30">
                      {step.icon}
                    </div>
                    <span className="text-[11px] font-black text-[#79D6B2] tracking-wider">STEP {step.num}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#79D6B2] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#D7E0DC] leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
