import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';
import { FiArrowRight, FiHeart, FiUsers, FiBriefcase, FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';

const ROLES_OPTIONS = [
  {
    value: 'user',
    label: 'Food Donor',
    subLabel: 'Restaurants, events & individuals',
    icon: FiHeart
  },
  {
    value: 'ngo',
    label: 'NGO Partner',
    subLabel: 'Non-profits & community kitchens',
    icon: FiUsers
  },
  {
    value: 'partner',
    label: 'Partner',
    subLabel: 'Corporate & logistics partners',
    icon: FiBriefcase
  }
];

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user'
    }
  });

  const selectedRole = watch('role');
  const password = watch('password');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role.toLowerCase()
      });
      toast.success('Account created successfully');
      const targetPath = ROLE_PATHS[user?.role] || ROLE_PATHS[(user?.role || '').toLowerCase()] || '/';
      navigate(targetPath, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* HEADINGS */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-[#292B29] tracking-tight">Create Your Account</h2>
        <p className="text-xs font-semibold text-[#626760]">Select your account type to join the FoodBridge network</p>
      </div>

      {/* VISUAL ROLE SELECTION CARDS */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">
          Choose Account Type
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLES_OPTIONS.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setValue('role', r.value, { shouldValidate: true })}
                className={`relative flex flex-col items-center justify-between rounded-xl border p-3.5 text-center transition-all ${
                  isSelected
                    ? 'border-[#BD715C] bg-[#F3DED6]/40 text-[#292B29] shadow-xs'
                    : 'border-[#E6DED6] bg-white text-[#626760] hover:border-[#BD715C]/40 hover:text-[#292B29]'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 text-[#BD715C]">
                    <FiCheckCircle className="h-3.5 w-3.5" />
                  </span>
                )}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-[#BD715C] text-white shadow-xs' : 'bg-[#FAF7F2] text-[#626760]'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="mt-2.5">
                  <span className="block text-xs font-extrabold text-[#292B29]">{r.label}</span>
                  <span className="block text-[10px] text-[#626760] leading-tight mt-0.5">{r.subLabel}</span>
                </div>
              </button>
            );
          })}
        </div>
        {/* Hidden select input for form register binding */}
        <input type="hidden" {...register('role', { required: 'Role is required' })} />
      </div>

      {/* INPUT FIELDS */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* FULL NAME */}
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[#626760]">
            Full Name
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#BD715C]">
              <FiUser className="h-4 w-4" />
            </div>
            <input
              id="name"
              placeholder="John Doe"
              {...register('name', { required: 'Full Name is required' })}
              className="w-full rounded-xl border border-[#E6DED6] bg-white pl-10 pr-4 py-3 text-sm text-[#292B29] placeholder-[#A8ADA5] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>⚠️</span> {errors.name.message}
            </p>
          )}
        </div>

        {/* EMAIL ADDRESS */}
        <div className="sm:col-span-2">
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
            <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>⚠️</span> {errors.email.message}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#626760]">
            Password
          </label>
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
            <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>⚠️</span> {errors.password.message}
            </p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[#626760]">
            Confirm Password
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#BD715C]">
              <FiLock className="h-4 w-4" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match'
              })}
              className="w-full rounded-xl border border-[#E6DED6] bg-white pl-10 pr-4 py-3 text-sm text-[#292B29] placeholder-[#A8ADA5] outline-none transition focus:border-[#BD715C] focus:ring-2 focus:ring-[#BD715C]/20"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>⚠️</span> {errors.confirmPassword.message}
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* FOOTER SWITCH */}
      <div className="pt-2 text-center text-xs font-medium text-[#626760]">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-extrabold text-[#BD715C] hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
};

export default RegisterPage;
