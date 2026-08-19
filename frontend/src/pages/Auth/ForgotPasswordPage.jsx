import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });
      setSubmitted(true);
      reset();
      toast.success('If this email exists, we will send a reset link shortly.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to send reset instructions right now.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Forgot password</h2>
        <p className="mt-3 text-sm text-slate-600">
          Enter the email address associated with your account, and we will send password recovery instructions.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email'
              }
            })}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Sending...' : submitted ? 'Request sent' : 'Send reset link'}
        </button>

        <div className="mt-4 text-center text-sm text-slate-600">
          <Link to="/auth/login" className="font-semibold text-secondary hover:underline">
            Remembered your password? Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
