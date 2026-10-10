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
    <div className="w-full space-y-6 rounded-[28px] bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl border border-[#E6DED6] text-[#292B29]">
      {/* CARD TOP HEADER WITH BRAND BADGE & NAVIGATION PILLS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E6DED6]/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3DED6] text-[#BD715C] shadow-xs border border-[#BD715C]/20">
            <FiHeart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#292B29]">FoodBridge Platform</h1>
            <p className="text-xs font-semibold text-[#626760]">Sign in or create a verified account</p>
          </div>
        </div>

        {/* AUTH NAVIGATION SWITCHER */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <NavLink
            to="login"
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 transition-all ${
                isActive
                  ? 'bg-[#BD715C] text-white font-extrabold shadow-xs'
                  : 'bg-[#FAF7F2] text-[#626760] border border-[#E6DED6] hover:bg-[#F3DED6]/50 hover:text-[#292B29]'
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
                  ? 'bg-[#BD715C] text-white font-extrabold shadow-xs'
                  : 'bg-[#FAF7F2] text-[#626760] border border-[#E6DED6] hover:bg-[#F3DED6]/50 hover:text-[#292B29]'
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
                  ? 'bg-[#BD715C] text-white font-extrabold shadow-xs'
                  : 'bg-[#FAF7F2] text-[#626760] border border-[#E6DED6] hover:bg-[#F3DED6]/50 hover:text-[#292B29]'
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
