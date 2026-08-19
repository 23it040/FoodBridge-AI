import { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/admin.service';
import { normalizePaginationResponse } from '../../utils/normalizeApiResponse';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiAlertTriangle, FiFilter, FiUserCheck, FiUserX, FiEye } from 'react-icons/fi';

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: 1, limit: 100 };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.listUsers(params);
      const normalized = normalizePaginationResponse(res, ['users']);
      setUsers(normalized.items);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusModalUser) return;
    setUpdating(true);
    try {
      await adminService.updateUserStatus(statusModalUser._id || statusModalUser.id, {
        status: newStatus,
        reason: statusReason
      });
      toast.success(`User status updated to ${newStatus}`);
      setStatusModalUser(null);
      setStatusReason('');
      loadUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Name & Email',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-extrabold text-[#1A312C]">{row.name || 'Unnamed User'}</div>
          <div className="text-xs text-slate-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (row) => {
        const role = String(row.role || 'user').toLowerCase();
        const badgeVariant = role === 'admin' ? 'danger' : role === 'ngo' ? 'info' : 'primary';
        return <Badge variant={badgeVariant}>{role.toUpperCase()}</Badge>;
      }
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (row) => {
        const st = String(row.status || 'ACTIVE').toUpperCase();
        const badgeVariant = st === 'ACTIVE' ? 'success' : st === 'SUSPENDED' ? 'warning' : 'danger';
        return <Badge variant={badgeVariant}>{st}</Badge>;
      }
    },
    {
      key: 'verificationStatus',
      title: 'Verification',
      render: (row) => {
        if (row.role !== 'ngo') return <span className="text-xs text-slate-400">N/A</span>;
        const vs = String(row.verificationStatus || 'PENDING').toUpperCase();
        return <Badge variant={vs === 'APPROVED' ? 'success' : vs === 'PENDING' ? 'warning' : 'danger'}>{vs}</Badge>;
      }
    },
    {
      key: 'createdAt',
      title: 'Registered Date',
      sortable: true,
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—')
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedUser(row)} className="gap-1 text-xs py-1 px-2">
            <FiEye className="h-3.5 w-3.5" />
            <span>View</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setStatusModalUser(row);
              setNewStatus(row.status || 'ACTIVE');
              setStatusReason(row.statusReason || '');
            }}
            className="gap-1 text-xs py-1 px-2 text-slate-700 hover:bg-slate-100"
          >
            {row.status === 'ACTIVE' ? <FiUserX className="h-3.5 w-3.5 text-amber-600" /> : <FiUserCheck className="h-3.5 w-3.5 text-emerald-600" />}
            <span>Status</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="User Governance"
        subtitle="Manage system user accounts, roles, and status enforcement"
        actions={
          <Button onClick={loadUsers} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#89D7B7] bg-[#FFF4E1]/30 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A312C]">
            <FiFilter className="h-4 w-4 text-[#428475]" />
            <span>Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
            >
              <option value="">All Roles</option>
              <option value="user">Donor / User</option>
              <option value="ngo">NGO Partner</option>
              <option value="admin">Administrator</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={44} />
            <p className="text-xs font-semibold text-slate-500">Loading users...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <div className="flex justify-center text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-800 text-sm">Unable to load users</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={loadUsers} className="mx-auto text-xs px-5 py-2">
              Retry Loading
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            rowsPerPage={15}
            searchPlaceholder="Search name, email..."
            emptyMessage="No users found."
          />
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal isOpen={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} title="User Account Profile">
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#428475] text-white font-extrabold text-lg">
                {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="font-extrabold text-[#1A312C] text-sm">{selectedUser.name}</h4>
                <p className="text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-700">Role:</span>
                <p className="font-semibold text-slate-900">{selectedUser.role}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700">Account Status:</span>
                <p className="font-semibold text-slate-900">{selectedUser.status || 'ACTIVE'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700">Phone:</span>
                <p className="font-semibold text-slate-900">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700">Verification Status:</span>
                <p className="font-semibold text-slate-900">{selectedUser.verificationStatus || 'N/A'}</p>
              </div>
            </div>

            {selectedUser.address && (
              <div className="border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-700">Address:</span>
                <p className="text-slate-800">{selectedUser.address}, {selectedUser.city || ''} {selectedUser.state || ''}</p>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Update Modal */}
      {statusModalUser && (
        <Modal isOpen={Boolean(statusModalUser)} onClose={() => setStatusModalUser(null)} title="Update Account Status">
          <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
            <p className="text-slate-700 font-medium">
              Updating status for <strong className="text-[#1A312C]">{statusModalUser.name} ({statusModalUser.email})</strong>
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason / Note (Optional)</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                rows={3}
                placeholder="Reason for changing user status..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setStatusModalUser(null)}>Cancel</Button>
              <Button type="submit" loading={updating}>Save Status</Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default Users;
