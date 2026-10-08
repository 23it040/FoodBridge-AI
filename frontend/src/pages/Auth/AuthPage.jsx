import { Navigate, NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';
import { FiHeart } from 'react-icons/fi';

const AuthPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const targetPath = ROLE_PATHS[user.role] || ROLE_PATHS[(user.role || '').toLowerCase()] || '/';
    return <Navigate replace to={targetPath} />;
  }

  return (
    <div className="w-full space-y-6 rounded-[24px] bg-[#102A2A]/85 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 text-white">
      {/* CARD TOP HEADER WITH BRAND BADGE & NAVIGATION PILLS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#061918] text-[#79D6B2] shadow-inner border border-[#79D6B2]/30">
            <FiHeart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">FoodBridge Platform</h1>
            <p className="text-xs font-semibold text-[#A7B8B3]">Sign in or create a verified account</p>
          </div>
        </div>

        {/* AUTH NAVIGATION SWITCHER */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <NavLink
            to="login"
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 transition-all ${
                isActive
                  ? 'bg-[#79D6B2] text-[#0A1A1A] font-extrabold shadow-[0_0_12px_rgba(121,214,178,0.35)]'
                  : 'bg-white/5 text-[#A7B8B3] border border-white/10 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            Sign In
          </NavLink>
          <NavLink
            to="register"
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 transition-all ${
                isActive
                  ? 'bg-[#79D6B2] text-[#0A1A1A] font-extrabold shadow-[0_0_12px_rgba(121,214,178,0.35)]'
                  : 'bg-white/5 text-[#A7B8B3] border border-white/10 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            Register
          </NavLink>
          <NavLink
            to="forgot-password"
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 transition-all ${
                isActive
                  ? 'bg-[#79D6B2] text-[#0A1A1A] font-extrabold shadow-[0_0_12px_rgba(121,214,178,0.35)]'
                  : 'bg-white/5 text-[#A7B8B3] border border-white/10 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            Forgot Password
          </NavLink>
        </div>
      </div>

      {/* DYNAMIC CHILD ROUTE CONTENT */}
      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthPage;
