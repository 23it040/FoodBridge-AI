import { memo, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/auth/login', { replace: true });
  }, [logout, navigate]);

  const dashboardPath = useMemo(() => ROLE_PATHS[user?.role] || '/', [user?.role]);

  const navClass = useCallback((isActive) => `transition-colors duration-200 ${isActive ? 'text-secondary' : 'text-slate-600 hover:text-secondary'}`, []);

  return (
    <header className="border-b border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="text-lg font-semibold text-primary">FoodBridge AI</div>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
            Home
          </NavLink>
          {!isAuthenticated && (
            <NavLink to="/auth/login" className={({ isActive }) => navClass(isActive)}>
              Sign In
            </NavLink>
          )}
          {isAuthenticated && user && (
            <>
              <NavLink to={dashboardPath} className={({ isActive }) => navClass(isActive)}>
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-secondary hover:text-secondary"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default memo(Navigation);
