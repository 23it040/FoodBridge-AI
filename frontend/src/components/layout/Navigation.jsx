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
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 sm:px-6 lg:px-8 pointer-events-none">
      <div className="mx-auto max-w-6xl pointer-events-auto">
        <div className="glass-nav rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xl transition-all duration-300">
          
          {/* LEFT: Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#79D6B2]/20 border border-[#79D6B2]/40 text-[#79D6B2] shadow-sm transition-transform duration-300 group-hover:scale-105">
              <FiBox className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#79D6B2] transition-colors">
              FoodBridge
            </span>
          </NavLink>

          {/* CENTER: Navigation Links */}
          <nav className="hidden items-center gap-7 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs font-semibold tracking-wide transition-all relative flex items-center gap-1.5 ${
                  isActive ? 'text-[#79D6B2]' : 'text-white/80 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#79D6B2] shadow-[0_0_8px_#79D6B2]" />}
                  <span>Home</span>
                </>
              )}
            </NavLink>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs font-semibold tracking-wide text-white/80 transition-colors hover:text-[#79D6B2]"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('live-discovery')}
              className="text-xs font-semibold tracking-wide text-white/80 transition-colors hover:text-[#79D6B2]"
            >
              Discover
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('live-discovery')}
              className="text-xs font-semibold tracking-wide text-white/80 transition-colors hover:text-[#79D6B2]"
            >
              NGOs
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('impact')}
              className="text-xs font-semibold tracking-wide text-white/80 transition-colors hover:text-[#79D6B2]"
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
                  className="px-3.5 py-1.5 text-xs font-semibold text-white/90 transition hover:text-white hover:bg-white/10 rounded-full"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/register"
                  className="inline-flex items-center gap-1.5 glass-btn-primary px-4 py-1.5 text-xs font-semibold rounded-full shadow-md"
                >
                  <span>Get Started</span>
                  <FiArrowRight className="h-3.5 w-3.5" />
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to={dashboardPath}
                  className="inline-flex items-center gap-1.5 glass-btn-primary px-4 py-1.5 text-xs font-semibold rounded-full"
                >
                  <FiBox className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 glass-btn-secondary px-3 py-1.5 text-xs font-medium rounded-full hover:border-red-400/50 hover:text-red-300"
                >
                  <FiLogOut className="h-3.5 w-3.5" />
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
              className="inline-flex items-center justify-center rounded-full p-2 text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mt-2 rounded-3xl glass-nav p-5 md:hidden text-white shadow-2xl">
            <div className="flex flex-col gap-3">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-xl"
              >
                Home
              </NavLink>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 rounded-xl"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('live-discovery')}
                className="text-left px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 rounded-xl"
              >
                Discover Food & NGOs
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('impact')}
                className="text-left px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 rounded-xl"
              >
                Impact
              </button>
              <div className="my-1 border-t border-white/10" />
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-1">
                  <NavLink
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-semibold text-white glass-btn-secondary rounded-full"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-semibold text-white glass-btn-primary rounded-full shadow-md"
                  >
                    Get Started Free
                  </NavLink>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <NavLink
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-semibold text-white glass-btn-primary rounded-full"
                  >
                    Go to Dashboard
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-red-300 bg-red-500/20 rounded-full border border-red-500/30"
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
