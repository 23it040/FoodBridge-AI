import { Outlet, Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

const AuthLayout = () => (
  <div className="min-h-screen bg-[#FFF4E1] text-[#1A312C] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
      <Link to="/" className="inline-flex items-center gap-3 group">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#428475] text-white shadow-md transition-transform group-hover:scale-105">
          <FiHeart className="h-6 w-6" />
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-[#1A312C]">
          FoodBridge <span className="text-[#428475]">AI</span>
        </span>
      </Link>
      <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#428475]">
        AI-Powered Sustainable Food Redistribution
      </p>
    </div>

    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="rounded-[24px] bg-white p-8 shadow-card border border-[#89D7B7]">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
