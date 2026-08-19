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
import { FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiXCircle, FiShield, FiFileText } from 'react-icons/fi';

const NGOVerification = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [rejectModalNgo, setRejectModalNgo] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadPendingNgos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listPendingNgos({ page: 1, limit: 100 });
      const normalized = normalizePaginationResponse(res, ['ngos']);
      setNgos(normalized.items);
    } catch (err) {
      console.error('Failed to fetch pending NGOs:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load pending NGOs');
      setNgos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingNgos();
  }, [loadPendingNgos]);

  const handleApprove = async (ngoId) => {
    setSubmittingAction(true);
    try {
      await adminService.approveNgo(ngoId, 'Verified and approved by admin');
      toast.success('NGO verification approved successfully!');
      loadPendingNgos();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve NGO');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalNgo) return;
    setSubmittingAction(true);
    try {
      await adminService.rejectNgo(rejectModalNgo._id || rejectModalNgo.id, rejectReason || 'Verification requirements not met.');
      toast.success('NGO verification request rejected');
      setRejectModalNgo(null);
      setRejectReason('');
      loadPendingNgos();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject NGO');
    } finally {
      setSubmittingAction(false);
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Organization Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-[#1A312C]">{row.name || 'Unnamed NGO'}</span>
          {row.registrationNumber && (
            <div className="text-xs font-medium text-slate-500">Reg: {row.registrationNumber}</div>
          )}
        </div>
      )
    },
    {
      key: 'email',
      title: 'Contact Details',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-[#1A312C]">{row.email}</div>
          <div className="text-xs text-slate-500">{row.phone || 'No phone'}</div>
        </div>
      )
    },
    {
      key: 'address',
      title: 'Location',
      render: (row) => <span className="text-xs text-slate-700">{row.address || row.city || 'Not provided'}</span>
    },
    {
      key: 'verificationStatus',
      title: 'Status',
      render: (row) => {
        const st = String(row.verificationStatus || 'PENDING').toUpperCase();
        return <Badge variant={st === 'APPROVED' ? 'success' : st === 'PENDING' ? 'warning' : 'danger'}>{st}</Badge>;
      }
    },
    {
      key: 'createdAt',
      title: 'Submitted On',
      sortable: true,
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—')
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleApprove(row._id || row.id)}
            disabled={submittingAction}
            className="gap-1 text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700"
          >
            <FiCheckCircle className="h-3.5 w-3.5" />
            <span>Approve</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRejectModalNgo(row)}
            disabled={submittingAction}
            className="gap-1 text-xs py-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50"
          >
            <FiXCircle className="h-3.5 w-3.5" />
            <span>Reject</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="NGO Verification Governance"
        subtitle="Review registration submissions and verify partner NGOs"
        actions={
          <Button onClick={loadPendingNgos} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={44} />
            <p className="text-xs font-semibold text-slate-500">Loading pending NGO verifications...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <div className="flex justify-center text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-800 text-sm">Unable to load pending NGOs</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={loadPendingNgos} className="mx-auto text-xs px-5 py-2">
              Retry Loading
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={ngos}
            rowsPerPage={15}
            searchPlaceholder="Search NGO name, email, registration ID..."
            emptyMessage="No NGOs awaiting verification."
          />
        )}
      </Card>

      {/* Reject Modal */}
      {rejectModalNgo && (
        <Modal isOpen={Boolean(rejectModalNgo)} onClose={() => setRejectModalNgo(null)} title="Decline NGO Verification">
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
            <p className="text-slate-700 font-medium">
              You are declining verification for <strong className="text-[#1A312C]">{rejectModalNgo.name}</strong>. Please state the reason for rejection:
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs"
                rows={4}
                placeholder="Specify missing documents, invalid registration number, etc..."
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRejectModalNgo(null)}>Cancel</Button>
              <Button type="submit" loading={submittingAction} className="bg-red-600 hover:bg-red-700">Confirm Rejection</Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default NGOVerification;
