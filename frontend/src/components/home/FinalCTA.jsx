import { Link } from 'react-router-dom';
import { FiArrowRight, FiBox, FiSearch } from 'react-icons/fi';

const FinalCTA = () => {
  return (
    <section className="py-24 bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F1DED7] via-[#FAF7F2] to-[#E2EBE5] p-10 sm:p-16 text-[#2E302D] border border-[#E5DED7] shadow-xl">
          
          {/* Subtle background ambient accents */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#B86F5B]/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[#7D9588]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-[#E5DED7] text-[#B86F5B] shadow-md">
              <FiBox className="h-7 w-7" />
            </div>

            <h2 className="text-3xl font-black tracking-tight text-[#2E302D] sm:text-5xl leading-tight">
              HAVE SURPLUS FOOD? <br />
              <span className="text-[#B86F5B]">LET'S MOVE IT WHERE IT MATTERS.</span>
            </h2>

            <p className="text-base text-[#73756F] leading-relaxed max-w-xl font-normal">
              Join local restaurants, caterers, and non-profit partners building a zero food waste redistribution network.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/auth/register">
                <button className="bg-[#B86F5B] hover:bg-[#A85F4D] text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-300 group">
                  <span>Donate Food</span>
                  <FiArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </Link>
              
              <a href="#live-discovery">
                <button className="bg-white border border-[#E5DED7] text-[#2E302D] hover:bg-[#F1DED7] hover:border-[#B86F5B] px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide flex items-center gap-2 shadow-sm transition-all duration-300">
                  <FiSearch className="h-4 w-4 text-[#B86F5B]" />
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
