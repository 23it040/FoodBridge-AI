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

const Donations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donations, setDonations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: 1, limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await adminService.listDonationsAdmin(params);
      const normalized = normalizePaginationResponse(res, ['donations']);
      setDonations(normalized.items);
    } catch (err) {
      console.error('Failed to fetch admin donations:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load donations');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const columns = [
    {
      key: 'foodName',
      title: 'Food Item',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-[#292B29]">{row.foodName || row.name || 'Unnamed Food'}</span>
          {row.category && <span className="ml-2 text-xs font-semibold text-[#626760]">({row.category})</span>}
        </div>
      )
    },
    {
      key: 'donorId',
      title: 'Donor',
      render: (row) => {
        const donor = row.donorId || row.donor;
        if (!donor) return <span className="text-xs text-slate-400">Anonymous</span>;
        return (
          <div>
            <div className="text-xs font-bold text-[#292B29]">{donor.name || 'Donor'}</div>
            <div className="text-xs text-[#626760]">{donor.email || ''}</div>
          </div>
        );
      }
    },
    {
      key: 'quantity',
      title: 'Qty / Servings',
      sortable: true,
      render: (row) => <span className="font-bold text-[#BD715C]">{row.quantity || 0}</span>
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (row) => {
        const st = String(row.status || 'AVAILABLE').toUpperCase();
        const variantMap = {
          AVAILABLE: 'success',
          ACCEPTED: 'info',
          COMPLETED: 'primary',
          EXPIRED: 'danger',
          REJECTED: 'danger'
        };
        return <Badge variant={variantMap[st] || 'secondary'}>{st}</Badge>;
      }
    },
    {
      key: 'createdAt',
      title: 'Date Created',
      sortable: true,
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—')
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedDonation(row)} className="gap-1.5 text-xs py-1 px-2.5">
          <FiEye className="h-3.5 w-3.5" />
          <span>Details</span>
        </Button>
      )
    }
  ];

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Food Donations Governance"
        subtitle="View and manage system-wide food donation listings"
        actions={
          <Button onClick={loadDonations} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DED6] bg-[#FAF7F2] p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#292B29]">
            <FiFilter className="h-4 w-4 text-[#BD715C]" />
            <span>Filters</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#E6DED6] bg-white px-3 py-2 text-xs font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="REQUESTED">REQUESTED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
            <input
              type="text"
              placeholder="Filter Category..."
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-[#E6DED6] bg-white px-3 py-2 text-xs font-semibold text-[#292B29] outline-none transition focus:border-[#BD715C] focus:ring-1 focus:ring-[#BD715C]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={44} />
            <p className="text-xs font-semibold text-slate-500">Loading food donations...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <div className="flex justify-center text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-800 text-sm">Unable to load donations</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={loadDonations} className="mx-auto text-xs px-5 py-2">
              Retry Loading
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={donations}
            rowsPerPage={15}
            searchPlaceholder="Search food name, donor, category..."
            emptyMessage="No donations found matching criteria."
          />
        )}
      </Card>

      {selectedDonation && (
        <Modal
          isOpen={Boolean(selectedDonation)}
          onClose={() => setSelectedDonation(null)}
          title="Donation Details"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-[#E6DED6] p-3 bg-[#FAF7F2]">
              <span className="font-bold text-[#292B29] text-sm">{selectedDonation.foodName || selectedDonation.name}</span>
              <div className="text-[#626760] mt-1">{selectedDonation.description || 'No description provided.'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-[#626760]">Category:</span>
                <p className="font-medium text-[#292B29]">{selectedDonation.category || 'General'}</p>
              </div>
              <div>
                <span className="font-bold text-[#626760]">Quantity:</span>
                <p className="font-medium text-[#292B29]">{selectedDonation.quantity || 0}</p>
              </div>
              <div>
                <span className="font-bold text-[#626760]">Status:</span>
                <p className="font-medium text-[#292B29]">{selectedDonation.status}</p>
              </div>
              <div>
                <span className="font-bold text-[#626760]">Expiry Date:</span>
                <p className="font-medium text-[#292B29]">
                  {selectedDonation.expiryDate ? new Date(selectedDonation.expiryDate).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="border-t border-[#E6DED6] pt-3 space-y-1">
              <span className="font-bold text-[#626760]">Donor Info:</span>
              <p className="text-[#292B29]">{selectedDonation.donorId?.name || 'Unknown Donor'}</p>
              <p className="text-[#626760]">{selectedDonation.donorId?.email || 'No email'}</p>
            </div>
            {selectedDonation.pickupAddress && (
              <div className="border-t border-[#E6DED6] pt-3">
                <span className="font-bold text-[#626760]">Pickup Address:</span>
                <p className="text-[#292B29] mt-0.5">{selectedDonation.pickupAddress}</p>
              </div>
            )}
            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setSelectedDonation(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Donations;
