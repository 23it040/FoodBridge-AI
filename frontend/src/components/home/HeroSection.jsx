import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiHeart, FiPlay } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';

const HeroSection = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const dashboardPath = useMemo(() => ROLE_PATHS[user?.role] || '/donor/dashboard', [user?.role]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <section className="relative min-h-[760px] lg:min-h-[88vh] w-full flex items-center justify-center overflow-hidden bg-[#F8F1E8] pt-28 pb-16 sm:pt-32 sm:pb-20">
      
      {/* 1. FULL-WIDTH LOOPING BACKGROUND VIDEO AT FULL OPACITY */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/videos/foodbridge-hero.mp4" type="video/mp4" />
        </video>

        {/* Fallback image if video fails to load or autoplay is restricted */}
        {!videoLoaded && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{ backgroundImage: `url('/images/hero-cinematic.png')` }}
          />
        )}
      </div>

      {/* 2. SUBTLE GOLDEN-HOUR AMBIENT TINT (WARM CREAM & SOFT PEACH ATMOSPHERE) */}
      <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-b from-[#F8F1E8]/10 via-[#F3D7C8]/15 to-[#F8F1E8]/25" />

      {/* 2B. LOCALIZED TRANSLUCENT CREAM GRADIENT BEHIND CENTRAL CONTENT (SHARP CONTRAST WITHOUT ANY OPAQUE BOX) */}
      <div 
        className="absolute inset-0 z-[6] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 900px 580px at 50% 50%, rgba(248, 241, 232, 0.72) 0%, rgba(248, 241, 232, 0.42) 50%, rgba(248, 241, 232, 0) 82%)'
        }}
      />

      {/* 3. SUBTLE BOTTOM FADE INTO NEXT CONTENT SECTION (#FAF7F2) */}
      <div className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none bg-gradient-to-t from-[#FAF7F2] to-transparent" />

      {/* 4. CENTERED HERO CONTENT GROUP */}
      <div className="relative z-20 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
        
        {/* Eyebrow Badge: Pill-shaped, translucent white/peach with terracotta text */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="mb-7 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FAF4ED]/90 backdrop-blur-md border border-[#BD715C]/35 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#BD715C] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#BD715C] animate-pulse" />
            <span>FOOD REDISTRIBUTION PLATFORM</span>
          </div>
        </motion.div>

        {/* Main Headline: Dark charcoal #292B29 with muted terracotta #BD715C highlight */}
        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          style={{ fontSize: 'clamp(2.5rem, 4.2vw, 4.5rem)' }}
          className="font-extrabold tracking-tight text-[#292B29] leading-[1.08] mb-5 sm:mb-6 select-none w-full"
        >
          <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">
            COME TOGETHER.
          </span> <br />
          <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">
            YOU AND US WILL
          </span> <br />
          <span className="text-[#BD715C] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] block mt-1 sm:inline sm:mt-0">
            FEED THE NEEDY.
          </span>
        </motion.h1>

        {/* Supporting Description: Dark muted gray #5E625D, max-w ~700px, 17-20px */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="text-[17px] sm:text-lg lg:text-[19px] text-[#5E625D] leading-relaxed max-w-[700px] font-normal mb-7 sm:mb-8 px-2"
        >
          FoodBridge connects surplus food with verified community organizations, helping good food reach people instead of going to waste.
        </motion.p>

        {/* Action CTA Buttons: Centered, primary terracotta, secondary translucent white */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full sm:w-auto"
        >
          <Link to={isAuthenticated ? dashboardPath : '/auth/register'} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-[#BD715C] hover:bg-[#A85F4D] text-white border border-[#D98A76]/50 px-8 py-4 sm:px-9 sm:py-4 h-[56px] sm:h-[60px] rounded-full font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_6px_20px_rgba(189,113,92,0.3)] hover:shadow-[0_10px_26px_rgba(189,113,92,0.45)] transition-all duration-[250ms] hover:-translate-y-0.5 group">
              <FiHeart className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-[250ms]" />
              <span>{isAuthenticated ? 'GO TO DASHBOARD' : 'GET STARTED'}</span>
              <FiArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-[250ms]" />
            </button>
          </Link>

          <a href="#live-discovery" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-white/85 hover:bg-white text-[#292B29] border border-white/80 backdrop-blur-md px-8 py-4 sm:px-9 sm:py-4 h-[56px] sm:h-[60px] rounded-full font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-[250ms] hover:-translate-y-0.5 group">
              <FiPlay className="h-3.5 w-3.5 text-[#BD715C] group-hover:scale-110 transition-transform duration-[250ms]" />
              <span>EXPLORE FOOD</span>
            </button>
          </a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-7 text-xs text-[#5E625D] font-medium w-full max-w-xl"
        >
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-[#6F987C]" />
            <span>Verified NGO Network</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-[#6F987C]" />
            <span>Real-Time Matching</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="h-4 w-4 text-[#6F987C]" />
            <span>Zero Food Waste</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
