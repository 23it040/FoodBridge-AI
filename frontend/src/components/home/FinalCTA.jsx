import { Link } from 'react-router-dom';
import { FiArrowRight, FiBox, FiSearch } from 'react-icons/fi';

const FinalCTA = () => {
  return (
    <section className="py-20 bg-[#0A1A1A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102A2A] via-[#173B32] to-[#0A1A1A] p-10 sm:p-16 text-white border border-white/15 shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#79D6B2]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[#2F8F72]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#79D6B2]/20 border border-[#79D6B2]/40 text-[#79D6B2] shadow-xl">
              <FiBox className="h-7 w-7" />
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl leading-tight">
              HAVE SURPLUS FOOD? <br />
              <span className="text-[#79D6B2]">LET'S MOVE IT WHERE IT MATTERS.</span>
            </h2>

            <p className="text-base text-[#D7E0DC] leading-relaxed max-w-xl font-normal">
              Join local restaurants, caterers, and non-profit partners building a zero food waste redistribution network.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/auth/register">
                <button className="glass-btn-primary px-8 py-3.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 shadow-2xl group">
                  <span>Donate Food</span>
                  <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <a href="#live-discovery">
                <button className="glass-btn-secondary px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide flex items-center gap-2">
                  <FiSearch className="h-4 w-4 text-[#79D6B2]" />
                  <span>Find Food</span>
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
