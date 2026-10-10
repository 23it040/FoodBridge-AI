import { Outlet, Link } from 'react-router-dom';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen auth-background text-[#292B29] flex flex-col justify-between overflow-x-hidden relative selection:bg-[#F3DED6] selection:text-[#BD715C]">
      {/* LIGHTWEIGHT AUTH HEADER */}
      <header className="relative z-20 w-full border-b border-[#E6DED6]/80 bg-white/80 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3DED6] text-[#BD715C] shadow-xs border border-[#E6DED6] transition-transform group-hover:scale-105">
              <FiHeart className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#292B29]">
              FoodBridge <span className="text-[#BD715C]">AI</span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#E6DED6] bg-white px-4 py-1.5 text-xs font-semibold text-[#626760] transition-all hover:border-[#BD715C]/60 hover:bg-[#F3DED6]/40 hover:text-[#BD715C]"
          >
            <FiArrowLeft className="h-3.5 w-3.5 text-[#BD715C]" />
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
      <footer className="relative z-20 border-t border-[#E6DED6]/60 bg-white/50 backdrop-blur-xs py-4 text-center text-xs font-medium text-[#626760]">
        © {new Date().getFullYear()} FoodBridge AI Platform • Sustainable Surplus Food Redistribution
      </footer>
    </div>
  );
};

export default AuthLayout;
