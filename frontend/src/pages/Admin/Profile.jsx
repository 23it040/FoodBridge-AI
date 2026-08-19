import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import userService from '../../services/user.service';
import { normalizeObjectResponse } from '../../utils/normalizeApiResponse';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { FiUser, FiUploadCloud, FiLock, FiAlertTriangle, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const ProfilePage = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const avatarRef = useRef(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getProfile();
      const profile = normalizeObjectResponse(res, ['user']);
      setUserProfile(profile);
      reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || 'admin',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || ''
      });
    } catch (err) {
      console.error('Failed to load admin profile:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load profile information');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await userService.updateProfile(values);
      if (avatarRef.current?.files?.length) {
        const fd = new FormData();
        fd.append('avatar', avatarRef.current.files[0]);
        await userService.uploadAvatar(fd);
      }
      toast.success('Admin profile updated successfully');
      loadProfile();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Administrator Profile"
        subtitle="Manage personal administrator details and security settings"
        actions={
          <Button onClick={loadProfile} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card title="Account Settings" icon={<FiUser className="h-5 w-5" />}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={44} />
            <p className="text-xs font-semibold text-slate-500">Loading admin profile...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <div className="flex justify-center text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-800 text-sm">Unable to load profile</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={loadProfile} className="mx-auto text-xs px-5 py-2">
              Retry Loading
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-[#FFF4E1]/40 border border-[#89D7B7]">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#428475] text-white font-extrabold text-xl shadow-xs">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-[#1A312C] text-base">{userProfile?.name || 'Administrator'}</h4>
                  <Badge variant="danger">ADMINISTRATOR</Badge>
                </div>
                <p className="text-xs font-medium text-slate-600">{userProfile?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  {...register('email')}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Avatar Upload
                </label>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#428475] file:text-white hover:file:bg-[#1A312C]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={submitting} className="px-6 py-2.5 text-xs">
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}
      </Card>
    </section>
  );
};

export default ProfilePage;
