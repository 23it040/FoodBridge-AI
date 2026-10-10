import { memo, useCallback, useMemo, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';
import { FiMenu, FiX, FiBox, FiLogOut, FiArrowRight } from 'react-icons/fi';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/auth/login', { replace: true });
  }, [logout, navigate]);

  const dashboardPath = useMemo(() => ROLE_PATHS[user?.role] || '/donor/dashboard', [user?.role]);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3.5 sm:px-6 lg:px-8 pointer-events-none">
      <div className="mx-auto w-[92%] sm:w-[90%] max-w-6xl pointer-events-auto">
        <div className="bg-white/85 backdrop-blur-[18px] border border-white/70 rounded-full px-6 py-3 sm:px-7 sm:py-3.5 flex items-center justify-between shadow-[0_4px_24px_rgba(41,43,41,0.06)] min-h-[64px] sm:min-h-[70px] transition-all duration-300">
          
          {/* LEFT: Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3D7C8]/70 border border-[#BD715C]/20 text-[#BD715C] shadow-sm transition-transform duration-300 group-hover:scale-105">
              <FiBox className="h-4 w-4 text-[#BD715C]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#292B29] group-hover:text-[#BD715C] transition-colors">
              Food<span className="text-[#7D9588]">Bridge</span>
            </span>
          </NavLink>

          {/* CENTER: Navigation Links */}
          <nav className="hidden items-center gap-7 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs font-semibold tracking-wide transition-all relative flex items-center gap-1.5 ${
                  isActive ? 'text-[#BD715C]' : 'text-[#5E625D] hover:text-[#292B29]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#BD715C]" />}
                  <span>Home</span>
                </>
              )}
            </NavLink>

            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs font-semibold tracking-wide text-[#5E625D] transition-colors hover:text-[#BD715C]"
            >
              How It Works
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('live-discovery')}
              className="text-xs font-semibold tracking-wide text-[#5E625D] transition-colors hover:text-[#BD715C]"
            >
              Discover
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('live-discovery')}
              className="text-xs font-semibold tracking-wide text-[#5E625D] transition-colors hover:text-[#BD715C]"
            >
              NGOs
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('impact')}
              className="text-xs font-semibold tracking-wide text-[#5E625D] transition-colors hover:text-[#BD715C]"
            >
              Impact
            </button>
          </nav>

          {/* RIGHT: Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {!isAuthenticated ? (
              <>
                <NavLink
                  to="/auth/login"
                  className="px-4 py-2 text-xs font-semibold text-[#292B29] transition hover:text-[#BD715C] hover:bg-[#F3D7C8]/40 rounded-full"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/register"
                  className="inline-flex items-center gap-1.5 bg-[#BD715C] hover:bg-[#A85F4D] text-white px-5 py-2.5 text-xs font-semibold rounded-full shadow-sm transition-all duration-300 hover:shadow group"
                >
                  <span>Get Started</span>
                  <FiArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to={dashboardPath}
                  className="inline-flex items-center gap-1.5 bg-[#BD715C] hover:bg-[#A85F4D] text-white px-5 py-2.5 text-xs font-semibold rounded-full shadow-sm transition"
                >
                  <FiBox className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 bg-white/80 border border-white/70 text-[#292B29] px-4 py-2 text-xs font-medium rounded-full hover:bg-[#F3D7C8]/40 hover:border-[#BD715C] transition shadow-sm"
                >
                  <FiLogOut className="h-3.5 w-3.5 text-[#5E625D]" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-full p-2 text-[#2E302D] hover:bg-[#F1DED7]/50"
            >
              {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-2xl bg-white/95 border border-[#E5DED7] p-5 md:hidden text-[#2E302D] shadow-xl backdrop-blur-md">
            <div className="flex flex-col gap-3">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-[#B86F5B] hover:bg-[#F1DED7]/40 rounded-xl"
              >
                Home
              </NavLink>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left px-3 py-2 text-sm font-semibold text-[#73756F] hover:bg-[#F1DED7]/40 hover:text-[#2E302D] rounded-xl"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('live-discovery')}
                className="text-left px-3 py-2 text-sm font-semibold text-[#73756F] hover:bg-[#F1DED7]/40 hover:text-[#2E302D] rounded-xl"
              >
                Discover Food & NGOs
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('impact')}
                className="text-left px-3 py-2 text-sm font-semibold text-[#73756F] hover:bg-[#F1DED7]/40 hover:text-[#2E302D] rounded-xl"
              >
                Impact
              </button>
              <div className="my-1 border-t border-[#E5DED7]" />
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-1">
                  <NavLink
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-semibold text-[#2E302D] bg-white border border-[#E5DED7] rounded-full"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-semibold text-white bg-[#B86F5B] rounded-full shadow"
                  >
                    Get Started Free
                  </NavLink>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <NavLink
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-semibold text-white bg-[#B86F5B] rounded-full"
                  >
                    Go to Dashboard
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-[#2E302D] bg-[#F1DED7] rounded-full border border-[#E5DED7]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default memo(Navigation);
