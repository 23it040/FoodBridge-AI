import { Outlet, Link } from 'react-router-dom';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#0A1A1A] text-white flex flex-col justify-between overflow-x-hidden relative selection:bg-[#79D6B2] selection:text-[#102A2A]">
      {/* SUBTLE BACKGROUND GREEN GLOW (HOMEPAGE DESIGN LANGUAGE) */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 25%, rgba(121, 214, 178, 0.12) 0%, transparent 60%),
                       radial-gradient(circle at 80% 80%, rgba(16, 42, 42, 0.5) 0%, transparent 50%)`
        }}
      />

      {/* LIGHTWEIGHT AUTH HEADER */}
      <header className="relative z-20 w-full border-b border-white/10 bg-[#0A1A1A]/80 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102A2A] text-[#79D6B2] shadow-[0_0_15px_rgba(121,214,178,0.2)] border border-[#79D6B2]/30 transition-transform group-hover:scale-105">
              <FiHeart className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              FoodBridge <span className="text-[#79D6B2]">AI</span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-[#A7B8B3] transition-all hover:border-[#79D6B2]/50 hover:bg-[#79D6B2]/10 hover:text-white"
          >
            <FiArrowLeft className="h-3.5 w-3.5 text-[#79D6B2]" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* MAIN AUTHENTICATION CONTAINER */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          <Outlet />
        </div>
      </main>

      {/* LIGHTWEIGHT FOOTER */}
      <footer className="relative z-20 border-t border-white/5 py-4 text-center text-xs font-medium text-[#A7B8B3]/60">
        © {new Date().getFullYear()} FoodBridge AI Platform • Sustainable Surplus Food Redistribution
      </footer>
    </div>
  );
};

export default AuthLayout;
