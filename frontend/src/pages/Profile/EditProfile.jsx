import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import userService from '../../services/user.service';
import useAuth from '../../hooks/useAuth';
import { FiUser, FiUpload } from 'react-icons/fi';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await userService.getProfile();
        if (!mounted) return;
        const profile = res?.data || res || {};
        reset(profile);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [reset]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await userService.updateProfile(values);
      if (avatarRef.current?.files?.length) {
        const fd = new FormData();
        fd.append('avatar', avatarRef.current.files[0]);
        await userService.uploadAvatar(fd);
      }
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;

  return (
    <section className="py-6 space-y-6">
      <PageHeader title="Edit Profile" subtitle="Update your contact information, address, and profile photo" />
      <Card title="Account Details" icon={<FiUser className="h-5 w-5 text-[#BD715C]" />}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Full Name *</label>
              <input
                {...register('name', { required: 'Full name is required' })}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
              />
              {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Phone Number</label>
              <input
                {...register('phone')}
                placeholder="+1 (555) 000-0000"
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">City</label>
              <input
                {...register('city')}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">State / Region</label>
              <input
                {...register('state')}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Pincode / Postal Code</label>
              <input
                {...register('pincode')}
                className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Street Address</label>
            <input
              {...register('address')}
              className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
            />
          </div>

          {String(user?.role).toLowerCase() === 'ngo' && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Organization Name</label>
                <input
                  {...register('organizationName')}
                  className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#626760]">Contact Person</label>
                <input
                  {...register('contactPerson')}
                  className="mt-1.5 w-full rounded-xl border border-[#E6DED6] bg-white px-4 py-3 text-sm font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
                />
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl border border-dashed border-[#BD715C]/40 bg-[#FAF7F2]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#292B29] mb-1 flex items-center gap-1.5">
              <FiUpload className="h-4 w-4 text-[#BD715C]" />
              <span>Profile Photo</span>
            </label>
            <input ref={avatarRef} type="file" accept="image/*" className="text-xs text-[#626760] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#BD715C] file:text-white hover:file:bg-[#A85F4D]" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={submitting} className="px-8 py-3 text-sm">
              Save Changes
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

export default EditProfile;
