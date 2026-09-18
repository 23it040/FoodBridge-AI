import { Outlet, Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

const AuthLayout = () => (
  <div className="min-h-screen bg-[#F6F7F4] text-[#102A2A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
      <Link to="/" className="inline-flex items-center gap-3 group">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F8F72] text-white shadow-md transition-transform group-hover:scale-105">
          <FiHeart className="h-6 w-6" />
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-[#102A2A]">
          FoodBridge <span className="text-[#2F8F72]">AI</span>
        </span>
      </Link>
      <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#2F8F72]">
        AI-Powered Sustainable Food Redistribution
      </p>
    </div>

    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="rounded-[28px] bg-white p-8 shadow-card border border-[#DDE5E1]">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
