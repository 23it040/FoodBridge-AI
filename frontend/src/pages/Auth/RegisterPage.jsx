import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';
import Button from '../../components/ui/Button';

const ROLES_OPTIONS = [
  { value: 'user', label: 'User / Food Donor' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
  { value: 'partner', label: 'Partner Organization' },
];

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
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
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <h2 className="text-xl font-extrabold text-[#1A312C] text-center">Create Your Account</h2>
        <p className="text-xs font-medium text-slate-500 text-center mt-1">Join FoodBridge AI to reduce waste & feed communities</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Full Name
          </label>
          <input
            id="name"
            placeholder="John Doe"
            {...register('name', { required: 'Name is required' })}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-2.5 text-sm text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
          />
          {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Email Address
          </label>
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
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-2.5 text-sm text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
          />
          {errors.email && <p className="mt-1 text-xs font-semibold text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' }
            })}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-2.5 text-sm text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
          />
          {errors.password && <p className="mt-1 text-xs font-semibold text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match'
            })}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-2.5 text-sm text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs font-semibold text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Account Type / Role
          </label>
          <select
            id="role"
            {...register('role', { required: 'Role is required' })}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-2.5 text-sm text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
          >
            {ROLES_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {errors.role && <p className="mt-1 text-xs font-semibold text-red-600">{errors.role.message}</p>}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          loading={submitting}
          className="w-full justify-center py-3 text-sm mt-2"
        >
          Create Account
        </Button>
      </div>

      <div className="pt-2 text-center text-xs font-medium text-slate-600">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-bold text-[#428475] hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
};

export default RegisterPage;
