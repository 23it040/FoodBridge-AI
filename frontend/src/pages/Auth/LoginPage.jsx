import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';
import { FiArrowRight, FiLock, FiMail, FiCheckCircle } from 'react-icons/fi';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: '23it030@charusat.edu.in', pass: 'Admin123!' },
  { role: 'NGO Partner', email: '23it040@charusat.edu.in', pass: '12345678' },
  { role: 'Donor', email: '23it046@charusat.edu.in', pass: '12345678' }
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const fromPath = location.state?.from?.pathname;

  const handleFillDemo = (email, pass) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    toast.success('Loaded demo credentials', { id: 'demo-toast' });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await login(data);
      toast.success('Successfully signed in');
      const destination = fromPath || ROLE_PATHS[user?.role] || ROLE_PATHS[(user?.role || '').toLowerCase()] || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* HEADINGS */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs font-semibold text-[#A7B8B3]">Sign in to continue to FoodBridge</p>
      </div>

      {/* DEMO ACCOUNTS QUICK-FILL PILLS */}
      <div className="rounded-xl border border-white/10 bg-[#061918]/60 p-3 text-center">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#79D6B2] mb-2">
          ⚡ Quick Demo Login Fill:
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleFillDemo(acc.email, acc.pass)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-[#D7E0DC] transition-all hover:border-[#79D6B2] hover:bg-[#79D6B2]/20 hover:text-white"
            >
              {acc.role}
            </button>
          ))}
        </div>
      </div>

      {/* FORM INPUTS */}
      <div className="space-y-4">
        {/* EMAIL INPUT */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#A7B8B3]">
            Email Address
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#70827D]">
              <FiMail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address'
                }
              })}
              className="w-full rounded-xl border border-white/15 bg-[#061918]/80 pl-10 pr-4 py-3 text-sm text-white placeholder-[#70827D] outline-none transition focus:border-[#79D6B2] focus:ring-2 focus:ring-[#79D6B2]/20"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-semibold text-[#FF6B6B] flex items-center gap-1">
              <span>⚠️</span> {errors.email.message}
            </p>
          )}
        </div>

        {/* PASSWORD INPUT */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#A7B8B3]">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-bold text-[#79D6B2] hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#70827D]">
              <FiLock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              className="w-full rounded-xl border border-white/15 bg-[#061918]/80 pl-10 pr-4 py-3 text-sm text-white placeholder-[#70827D] outline-none transition focus:border-[#79D6B2] focus:ring-2 focus:ring-[#79D6B2]/20"
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-semibold text-[#FF6B6B] flex items-center gap-1">
              <span>⚠️</span> {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-[#79D6B2] hover:bg-[#68D8B0] text-[#0A1A1A] font-extrabold rounded-xl shadow-[0_0_20px_rgba(121,214,178,0.25)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin text-[#0A1A1A]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* FOOTER SWITCH */}
      <div className="pt-2 text-center text-xs font-medium text-[#A7B8B3]">
        Don't have an account?{' '}
        <Link to="/auth/register" className="font-extrabold text-[#79D6B2] hover:underline">
          Create Account
        </Link>
      </div>
    </form>
  );
};

export default LoginPage;
