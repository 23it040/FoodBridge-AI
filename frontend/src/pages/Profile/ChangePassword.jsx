import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import userService from '../../services/user.service';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await userService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password updated successfully');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      toast.error('Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const newPass = watch('newPassword');

  return (
    <section className="py-6 space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Change Password" subtitle="Ensure your account stays secure with a strong password" />
      <Card title="Security Credentials" icon={<FiLock className="h-5 w-5" />}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Current Password *</label>
            <div className="relative mt-1.5">
              <input
                type={show.current ? 'text' : 'password'}
                {...register('currentPassword', { required: 'Current password is required' })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#428475]"
              >
                {show.current ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="mt-1 text-xs font-semibold text-red-600">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">New Password *</label>
            <div className="relative mt-1.5">
              <input
                type={show.new ? 'text' : 'password'}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, new: !s.new }))}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#428475]"
              >
                {show.new ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="mt-1 text-xs font-semibold text-red-600">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Confirm New Password *</label>
            <div className="relative mt-1.5">
              <input
                type={show.confirm ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (v) => v === newPass || 'Passwords do not match'
                })}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-[#FFF4E1]/20 px-4 py-3 text-sm font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#428475]"
              >
                {show.confirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs font-semibold text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Button type="submit" loading={submitting} className="px-8 py-3 text-sm">
              Update Password
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default ChangePassword;
