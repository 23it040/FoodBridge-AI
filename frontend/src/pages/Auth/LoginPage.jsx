import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { ROLE_PATHS } from '../../constants/roles';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const fromPath = location.state?.from?.pathname;

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
      <div>
        <h2 className="text-xl font-extrabold text-[#1A312C] text-center">Welcome Back</h2>
        <p className="text-xs font-medium text-slate-500 text-center mt-1">Sign in to your FoodBridge AI account</p>
      </div>

      <div className="space-y-4">
        <div>
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
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
          />
          {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <Link to="/auth/forgot-password" className="text-xs font-semibold text-[#428475] hover:text-[#1A312C]">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' }
            })}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm text-[#1A312C] outline-none transition focus:border-[#428475] focus:ring-2 focus:ring-[#428475]/20"
          />
          {errors.password && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.password.message}</p>}
        </div>
      </div>

      <div>
        <Button
          type="submit"
          loading={submitting}
          className="w-full justify-center py-3 text-sm"
        >
          Sign In
        </Button>
      </div>

      <div className="pt-2 text-center text-xs font-medium text-slate-600">
        New user?{' '}
        <Link to="/auth/register" className="font-bold text-[#428475] hover:underline">
          Create an Account
        </Link>
      </div>
    </form>
  );
};

export default LoginPage;
