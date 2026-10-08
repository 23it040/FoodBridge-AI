import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsDropdown from '../components/layout/NotificationsDropdown';
import Sidebar from '../components/layout/Sidebar';
import ErrorBoundary from '../components/error/ErrorBoundary';
import useAuth from '../hooks/useAuth';
import { FiMenu, FiBox, FiLogOut } from 'react-icons/fi';

const DashboardLayout = ({ portalName = 'Dashboard', sidebarItems = [], children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('foodbridge_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('foodbridge_sidebar_collapsed', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save sidebar state to localStorage:', err);
      }
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 350);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F7F4] text-[#17201F] flex flex-col">
      {/* SINGLE UNIFIED DASHBOARD TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#DDE5E1] bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6 h-[61px] shrink-0 flex items-center">
        <div className="w-full mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#DDE5E1] bg-white text-[#17201F] transition hover:border-[#2F8F72] hover:text-[#2F8F72] md:hidden"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102A2A] text-[#79D6B2] shadow-sm transition group-hover:scale-105">
                <FiBox className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#17201F]">
                FoodBridge
              </span>
            </Link>

            <span className="hidden sm:inline-flex items-center rounded-full bg-[#E8F6F0] px-2.5 py-0.5 text-[11px] font-bold text-[#2F8F72]">
              {portalName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden md:inline-flex text-xs font-semibold text-[#687370] hover:text-[#2F8F72] transition"
            >
              Back to Home
            </Link>
            <NotificationsDropdown />
            {user && (
              <div className="flex items-center gap-2.5 border-l border-[#DDE5E1] pl-3">
                <span className="hidden sm:block text-xs font-bold text-[#17201F]">
                  {user.name || user.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/auth/login', { replace: true });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DDE5E1] px-3 py-1.5 text-xs font-semibold text-[#687370] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Logout"
                >
                  <FiLogOut className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY: SIDEBAR + MAIN CONTENT */}
      <div className="flex flex-1 min-h-[calc(100vh-61px)] relative">
        <Sidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={handleToggleCollapse}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0 transition-all duration-300">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
