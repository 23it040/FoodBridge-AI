import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';
import { FiMail, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

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
      toast.success('If this email exists, password reset instructions were sent.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to send reset instructions right now.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADINGS */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight">Forgot Password</h2>
        <p className="text-xs font-semibold text-[#A7B8B3] max-w-md mx-auto">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      {submitted && (
        <div className="rounded-xl border border-[#79D6B2]/30 bg-[#79D6B2]/10 p-3.5 text-xs text-center font-semibold text-[#79D6B2] flex items-center justify-center gap-2">
          <FiCheckCircle className="h-4 w-4 shrink-0" />
          <span>Reset instructions sent! Please check your inbox.</span>
        </div>
      )}

      {/* FORM */}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#79D6B2] hover:bg-[#68D8B0] text-[#0A1A1A] font-extrabold rounded-xl shadow-[0_0_20px_rgba(121,214,178,0.25)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-[#0A1A1A]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Sending Instructions...</span>
              </>
            ) : (
              <>
                <span>{submitted ? 'Resend Instructions' : 'Send Reset Link'}</span>
                <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        <div className="pt-2 text-center text-xs font-medium text-[#A7B8B3]">
          Remembered your password?{' '}
          <Link to="/auth/login" className="font-extrabold text-[#79D6B2] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
