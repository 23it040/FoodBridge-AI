import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import userService from '../../services/user.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const ProfilePage = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await userService.getProfile();
        const profile = res?.data || res || {};
        if (!mounted) return;
        reset(profile);
      } catch (error) {
        console.error(error);
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
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;

  return (
    <section className="py-6">
      <PageHeader title="Profile" subtitle="Update your profile and avatar" />
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full name</label>
              <input {...register('name')} className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input {...register('phone')} className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Avatar</label>
            <input ref={avatarRef} type="file" accept="image/*" className="mt-2" />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>{submitting ? <Spinner size={18} /> : 'Save'}</Button>
          </div>
        </form>
      </Card>
    </section>
  );
};

export default ProfilePage;
