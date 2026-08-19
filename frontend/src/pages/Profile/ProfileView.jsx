import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import ErrorState from '../../components/ui/ErrorState';
import useAuth from '../../hooks/useAuth';
import useApiCache from '../../hooks/useApiCache';
import Avatar from '../../components/ui/Avatar';

const ProfileView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, loading, error, refetch } = useApiCache('/users/profile', {}, 120000);

  const role = useMemo(() => profile?.role || user?.role || 'user', [profile?.role, user?.role]);
  const address = useMemo(
    () => [profile?.address, profile?.city, profile?.state, profile?.pincode].filter(Boolean).join(', ') || '—',
    [profile?.address, profile?.city, profile?.state, profile?.pincode]
  );

  if (loading) return <div className="py-12 text-center"><Spinner size={48} /></div>;
  if (error) return <div className="py-12"><ErrorState title="Unable to load profile" description="Please refresh to try again." action={<Button onClick={() => refetch()}>Retry</Button>} /></div>;
  if (!profile) return <div className="py-12 text-center text-slate-500">No profile found</div>;

  return (
    <section className="py-6 space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your account information and preferences" />

      {/* Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#1A312C] p-8 text-white shadow-elevated border border-[#89D7B7]">
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-[#428475]/30 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <Avatar src={profile.avatar || profile.photo || ''} size="lg" className="border-4 border-[#89D7B7]" />
          </div>
          <div className="text-center md:text-left flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-2xl font-extrabold text-white">{profile.name || profile.fullName || 'User'}</h2>
              <Badge variant="secondary">{role}</Badge>
            </div>
            <p className="text-xs text-[#89D7B7] font-medium">{profile.email}</p>
            {profile.organizationName && <p className="text-xs text-slate-300 font-semibold">{profile.organizationName}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/profile/edit')} variant="secondary">
              Edit Profile
            </Button>
            <Button onClick={() => navigate('/profile/change-password')} variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              Change Password
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Account Details" className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div className="rounded-2xl border border-slate-100 bg-[#FFF4E1]/30 p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</div>
              <div className="mt-1 font-semibold text-[#1A312C]">{profile.phone || 'Not provided'}</div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-[#FFF4E1]/30 p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</div>
              <div className="mt-1 font-semibold text-[#1A312C]">{address}</div>
            </div>

            {String(role).toLowerCase() === 'ngo' && (
              <>
                <div className="rounded-2xl border border-slate-100 bg-[#FFF4E1]/30 p-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</div>
                  <div className="mt-1 font-semibold text-[#1A312C]">{profile.organizationName || '—'}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-[#FFF4E1]/30 p-4">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</div>
                  <div className="mt-1 font-semibold text-[#1A312C]">{profile.contactPerson || '—'}</div>
                </div>
              </>
            )}

            <div className="rounded-2xl border border-slate-100 bg-[#FFF4E1]/30 p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</div>
              <div className="mt-1 flex items-center gap-2 font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {profile.status || 'Active'}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-[#FFF4E1]/30 p-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</div>
              <div className="mt-1 font-semibold text-[#1A312C]">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recent'}</div>
            </div>
          </div>
        </Card>

        <Card title="Quick Security">
          <div className="space-y-3 text-xs font-medium text-slate-600">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <strong className="text-[#1A312C] block">Role Permissions</strong>
              Assigned as <span className="text-[#428475] font-bold">{role}</span> in FoodBridge AI network.
            </div>
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <strong className="text-[#1A312C] block">Password Policy</strong>
              Protected by JWT session token.
            </div>
            <Button onClick={() => navigate('/settings')} variant="outline" className="w-full justify-center">
              Account Settings
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ProfileView;
