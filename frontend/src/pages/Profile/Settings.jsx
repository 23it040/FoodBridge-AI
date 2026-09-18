import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/user.service';
import toast from 'react-hot-toast';
import { FiSettings, FiShield, FiLogOut, FiTrash2 } from 'react-icons/fi';

const Settings = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.deleteAccount();
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Account deletion not available');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <section className="py-6 space-y-6">
      <PageHeader title="Account Settings" subtitle="Preferences, active sessions, and security governance" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Account Overview" icon={<FiSettings className="h-5 w-5" />}>
          <div className="space-y-3 text-xs font-medium text-[#102A2A]">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F4] border border-[#DDE5E1]">
              <span className="text-[#687370] font-semibold uppercase tracking-wider">Signed in as</span>
              <span className="font-extrabold text-[#102A2A] text-sm">{user?.email || 'User'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F4] border border-[#DDE5E1]">
              <span className="text-[#687370] font-semibold uppercase tracking-wider">Platform Role</span>
              <span className="font-extrabold text-[#2F8F72] uppercase text-xs px-2.5 py-1 rounded-full bg-[#E8F6F0] border border-[#79D6B2]">
                {user?.role || 'user'}
              </span>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleLogout} className="gap-2">
              <FiLogOut className="h-4 w-4" />
              <span>Log Out</span>
            </Button>
            <Button onClick={() => setConfirmOpen(true)} variant="danger" className="gap-2">
              <FiTrash2 className="h-4 w-4" />
              <span>Delete Account</span>
            </Button>
          </div>
        </Card>

        <Card title="Security & Sessions" icon={<FiShield className="h-5 w-5" />}>
          <div className="space-y-3 text-xs font-medium text-[#687370]">
            <div className="p-3 rounded-xl bg-[#E8F6F0]/50 border border-[#79D6B2]">
              <strong className="text-[#102A2A] block font-extrabold">Active Authentication Session</strong>
              JWT Bearer Token active. Session auto-renews upon API requests.
            </div>
            <div className="p-3 rounded-xl bg-[#F6F7F4] border border-[#DDE5E1]">
              <strong className="text-[#102A2A] block font-extrabold">Data Protection & Privacy</strong>
              All donor and NGO records are encrypted and stored in secure MongoDB clusters.
            </div>
          </div>
        </Card>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete Account"
        description="This action will permanently delete your account and all associated food donation data. Are you sure you want to proceed?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </section>
  );
};

export default Settings;
