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
        <h2 className="text-2xl font-black text-[#292B29] tracking-tight">Forgot Password</h2>
        <p className="text-xs font-semibold text-[#626760] max-w-md mx-auto">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      {submitted && (
        <div className="rounded-2xl border border-[#BD715C]/30 bg-[#F3DED6]/40 p-3.5 text-xs text-center font-semibold text-[#BD715C] flex items-center justify-center gap-2">
          <FiCheckCircle className="h-4 w-4 shrink-0" />
          <span>Reset instructions sent! Please check your inbox.</span>
        </div>
      )}

      {/* FORM */}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#BD715C] hover:bg-[#A85F4D] text-white font-extrabold rounded-full shadow-[0_4px_14px_rgba(189,113,92,0.25)] hover:shadow-[0_6px_20px_rgba(189,113,92,0.35)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
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

        <div className="pt-2 text-center text-xs font-medium text-[#626760]">
          Remembered your password?{' '}
          <Link to="/auth/login" className="font-extrabold text-[#BD715C] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
