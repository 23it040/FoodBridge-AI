import { Navigate, NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';

const AuthPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate replace to={ROLE_PATHS[user.role] || '/'} />;
  }

  return (
    <section className="grid min-h-[calc(100vh-6rem)] place-items-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-2xl space-y-6 rounded-[2rem] bg-white p-8 shadow-card ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Welcome back.</h1>
            <p className="mt-2 text-slate-600">Sign in or create a new account to continue on FoodBridge AI.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <NavLink
              to="login"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="register"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`
              }
            >
              Register
            </NavLink>
            <NavLink
              to="forgot-password"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
