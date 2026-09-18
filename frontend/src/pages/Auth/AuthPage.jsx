import { Navigate, NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';
import { FiBox } from 'react-icons/fi';

const AuthPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate replace to={ROLE_PATHS[user.role] || '/'} />;
  }

  return (
    <section className="grid min-h-[calc(100vh-6rem)] place-items-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-2xl space-y-6 rounded-[28px] bg-white p-8 shadow-2xl border border-[#DDE5E1]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#102A2A] text-[#79D6B2] shadow-sm">
              <FiBox className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#102A2A]">FoodBridge Platform</h1>
              <p className="text-xs font-semibold text-[#687370] mt-0.5">Sign in or create a verified partner account</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <NavLink
              to="login"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition-all ${
                  isActive ? 'bg-[#2F8F72] text-white shadow-sm' : 'bg-[#E8F6F0] text-[#102A2A] hover:bg-[#79D6B2]/30'
                }`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="register"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition-all ${
                  isActive ? 'bg-[#2F8F72] text-white shadow-sm' : 'bg-[#E8F6F0] text-[#102A2A] hover:bg-[#79D6B2]/30'
                }`
              }
            >
              Register
            </NavLink>
            <NavLink
              to="forgot-password"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition-all ${
                  isActive ? 'bg-[#2F8F72] text-white shadow-sm' : 'bg-[#E8F6F0] text-[#102A2A] hover:bg-[#79D6B2]/30'
                }`
              }
            >
              Forgot Password
            </NavLink>
          </div>
        </div>
        <Outlet />
      </div>
    </section>
  );
};

export default AuthPage;
