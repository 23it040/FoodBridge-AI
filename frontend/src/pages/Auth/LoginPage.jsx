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
        <h2 className="text-2xl font-black text-[#292B29] tracking-tight">Welcome Back</h2>
        <p className="text-xs font-semibold text-[#626760]">Sign in to continue to FoodBridge</p>
      </div>

      {/* DEMO ACCOUNTS QUICK-FILL PILLS */}
      <div className="rounded-2xl border border-[#E6DED6] bg-[#FAF7F2] p-3.5 text-center">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#BD715C] mb-2">
          ⚡ Quick Demo Login Fill:
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleFillDemo(acc.email, acc.pass)}
              className="rounded-full border border-[#E6DED6] bg-white px-3 py-1 text-xs font-bold text-[#626760] transition-all hover:border-[#BD715C] hover:bg-[#F3DED6] hover:text-[#BD715C]"
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
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#626760]">
            Email Address
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#BD715C]">
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
              className="w-full rounded-xl border border-[#E6DED6] bg-white pl-10 pr-4 py-3 text-sm text-[#292B29] placeholder-[#A8ADA5] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>⚠️</span> {errors.email.message}
            </p>
          )}
        </div>

        {/* PASSWORD INPUT */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#626760]">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-bold text-[#BD715C] hover:text-[#A85F4D] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#BD715C]">
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
              className="w-full rounded-xl border border-[#E6DED6] bg-white pl-10 pr-4 py-3 text-sm text-[#292B29] placeholder-[#A8ADA5] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
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
          className="w-full py-3.5 bg-[#BD715C] hover:bg-[#A85F4D] text-white font-extrabold rounded-full shadow-[0_4px_14px_rgba(189,113,92,0.25)] hover:shadow-[0_6px_20px_rgba(189,113,92,0.35)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:-translate-y-0.5"
        >
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
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
      <div className="pt-2 text-center text-xs font-medium text-[#626760]">
        Don't have an account?{' '}
        <Link to="/auth/register" className="font-extrabold text-[#BD715C] hover:underline">
          Create Account
        </Link>
      </div>
    </form>
  );
};

export default LoginPage;
