import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiHeart, FiPlay } from 'react-icons/fi';

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] lg:min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A1A1A] pt-20 pb-12">
      {/* 1. CINEMATIC BACKGROUND IMAGE WITH SLOW INITIAL SCALE */}
      <motion.div
        initial={{ scale: 1.04, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: [0.25, 1, 0.5, 1] }}
        className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[center_right] sm:bg-[center_center]"
        style={{
          backgroundImage: `url('/images/foodbridge-hero.png')`
        }}
      />

      {/* 2. DARK CINEMATIC GRADIENT OVERLAY */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, 
            rgba(10, 26, 26, 0.92) 0%, 
            rgba(10, 26, 26, 0.78) 40%, 
            rgba(10, 26, 26, 0.35) 70%, 
            rgba(10, 26, 26, 0.45) 100%)`
        }}
      />
      {/* Top and bottom subtle vignettes */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-[#0A1A1A]/70 via-transparent to-[#0A1A1A]" />

      {/* 3. HERO CONTENT CONTAINER */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center min-h-[75vh]">
          
          {/* HERO TYPOGRAPHY & ACTIONS */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 max-w-2xl text-left"
          >
            {/* HERO GLASS BADGE */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#79D6B2]"
            >
              <span className="h-2 w-2 rounded-full bg-[#79D6B2] animate-pulse shadow-[0_0_8px_#79D6B2]" />
              <span>🌿 FOOD REDISTRIBUTION PLATFORM</span>
            </motion.div>

            {/* MAIN HEADLINE */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              COME TOGETHER. <br />
              YOU AND US WILL <br />
              <span className="text-[#79D6B2] drop-shadow-[0_0_25px_rgba(121,214,178,0.3)]">
                FEED THE NEEDY.
              </span>
            </h1>

            {/* RED HUMANITARIAN ACCENT TAG */}
            <div className="inline-block rounded-md bg-[#D94A4A]/25 border border-[#D94A4A]/40 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#FF7B7B]">
              "NO FOOD SHOULD GO TO WASTE."
            </div>

            {/* SUPPORTING DESCRIPTION */}
            <p className="text-base sm:text-lg text-[#D7E0DC] leading-relaxed max-w-xl font-normal">
              FoodBridge connects surplus food with verified community organizations, helping good food reach people instead of going to waste.
            </p>

            {/* CTA BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/auth/register">
                <button className="glass-btn-primary px-7 py-3.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-xl group">
                  <FiHeart className="h-4 w-4 text-[#79D6B2] group-hover:scale-110 transition-transform" />
                  <span>Get Started</span>
                  <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <a href="#live-discovery">
                <button className="glass-btn-secondary px-7 py-3.5 rounded-full font-semibold text-sm tracking-wide flex items-center gap-2">
                  <FiPlay className="h-3.5 w-3.5 text-[#79D6B2]" />
                  <span>Explore Food</span>
                </button>
              </a>
            </div>

            {/* TRUST INDICATORS */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-[#D7E0DC]/80 font-medium border-t border-white/10 max-w-lg">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="h-4 w-4 text-[#79D6B2]" />
                <span>Verified NGO Network</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="h-4 w-4 text-[#79D6B2]" />
                <span>Real-Time Logistics</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="h-4 w-4 text-[#79D6B2]" />
                <span>Zero Fake Data</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
