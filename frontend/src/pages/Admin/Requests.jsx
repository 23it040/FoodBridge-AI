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
import { FiRefreshCw, FiAlertTriangle, FiEye, FiFilter } from 'react-icons/fi';

const Requests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: 1, limit: 100 };
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.listRequestsAdmin(params);
      const normalized = normalizePaginationResponse(res, ['requests']);
      setRequests(normalized.items);
    } catch (err) {
      console.error('Failed to fetch admin food requests:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load food requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const columns = [
    {
      key: 'foodId',
      title: 'Food Item',
      sortable: true,
      render: (row) => {
        const food = row.foodId || row.donation;
        return (
          <div>
            <span className="font-extrabold text-[#1A312C]">{food?.foodName || row.donationName || 'Food Item'}</span>
            {food?.category && <span className="ml-2 text-xs font-semibold text-slate-500">({food.category})</span>}
          </div>
        );
      }
    },
    {
      key: 'ngoId',
      title: 'Claiming NGO',
      render: (row) => {
        const ngo = row.ngoId || row.ngo;
        return (
          <div>
            <div className="text-xs font-bold text-[#1A312C]">{ngo?.name || row.ngoName || 'NGO Partner'}</div>
            <div className="text-xs text-slate-500">{ngo?.email || ''}</div>
          </div>
        );
      }
    },
    {
      key: 'donorId',
      title: 'Donor',
      render: (row) => {
        const donor = row.donorId || row.donor;
        return <span className="text-xs font-semibold text-slate-700">{donor?.name || 'Donor'}</span>;
      }
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (row) => {
        const st = String(row.status || 'PENDING').toUpperCase();
        const variantMap = {
          PENDING: 'warning',
          ACCEPTED: 'info',
          COMPLETED: 'success',
          REJECTED: 'danger',
          CANCELLED: 'secondary'
        };
        return <Badge variant={variantMap[st] || 'secondary'}>{st}</Badge>;
      }
    },
    {
      key: 'createdAt',
      title: 'Requested Date',
      sortable: true,
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—')
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedRequest(row)} className="gap-1 text-xs py-1 px-2.5">
          <FiEye className="h-3.5 w-3.5" />
          <span>Details</span>
        </Button>
      )
    }
  ];

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Food Requests Governance"
        subtitle="Monitor claim requests and redistribution activity across NGO partners"
        actions={
          <Button onClick={loadRequests} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#89D7B7] bg-[#FFF4E1]/30 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A312C]">
            <FiFilter className="h-4 w-4 text-[#428475]" />
            <span>Filter Status</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="PICKED_UP">PICKED_UP</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={44} />
            <p className="text-xs font-semibold text-slate-500">Loading food requests...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <div className="flex justify-center text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-800 text-sm">Unable to load requests</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={loadRequests} className="mx-auto text-xs px-5 py-2">
              Retry Loading
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={requests}
            rowsPerPage={15}
            searchPlaceholder="Search food, NGO, donor..."
            emptyMessage="No requests found matching criteria."
          />
        )}
      </Card>

      {/* Details Modal */}
      {selectedRequest && (
        <Modal isOpen={Boolean(selectedRequest)} onClose={() => setSelectedRequest(null)} title="Food Request Details">
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
              <span className="font-bold text-[#1A312C] text-sm">
                Request #{selectedRequest._id ? selectedRequest._id.slice(-6) : 'ID'}
              </span>
              <div className="text-slate-600 mt-1">
                Message: {selectedRequest.requestMessage || 'No custom message.'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-700">Food Item:</span>
                <p className="font-semibold text-slate-900">{selectedRequest.foodId?.foodName || selectedRequest.donationName || 'Food'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700">Quantity:</span>
                <p className="font-semibold text-slate-900">{selectedRequest.foodId?.quantity || 'N/A'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700">NGO Partner:</span>
                <p className="font-semibold text-slate-900">{selectedRequest.ngoId?.name || 'NGO'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-700">Donor:</span>
                <p className="font-semibold text-slate-900">{selectedRequest.donorId?.name || 'Donor'}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-700">Current Status:</span>
              <p className="font-extrabold text-[#428475]">{selectedRequest.status}</p>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Requests;
