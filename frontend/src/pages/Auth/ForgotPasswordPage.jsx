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
        <h2 className="text-xl font-extrabold text-[#102A2A] text-center">Forgot Password</h2>
        <p className="mt-1 text-xs font-semibold text-[#687370] text-center">
          Enter the email address associated with your account, and we will send password recovery instructions.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#687370]">
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
                message: 'Enter a valid email'
              }
            })}
            className="mt-1.5 w-full rounded-xl border border-[#DDE5E1] bg-white px-4 py-3 text-sm text-[#102A2A] outline-none transition focus:border-[#2F8F72] focus:ring-2 focus:ring-[#2F8F72]/20"
          />
          {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#2F8F72] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#102A2A] shadow-md disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Sending...' : submitted ? 'Request Sent' : 'Send Reset Link'}
        </button>

        <div className="mt-4 text-center text-xs font-medium text-[#687370]">
          <Link to="/auth/login" className="font-bold text-[#2F8F72] hover:underline">
            Remembered your password? Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
