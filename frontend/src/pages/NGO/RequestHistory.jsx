import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import requestService from '../../services/request.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiClock, FiEye } from 'react-icons/fi';

const renderStatusBadge = (status) => {
  const s = String(status || 'PENDING').toUpperCase();
  switch (s) {
    case 'ACCEPTED':
      return <Badge variant="success">Accepted</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    default:
      return <Badge variant="warning">{status}</Badge>;
  }
};

const RequestHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestService.listRequests({ page: 1, limit: 100 });
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setRequests(list);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch request history.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Historical records represent requests that have received a decision (ACCEPTED or REJECTED)
  const historicalRequests = useMemo(() => {
    return requests.filter((r) => {
      const s = String(r.status || '').toUpperCase();
      return s === 'ACCEPTED' || s === 'REJECTED';
    });
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'ALL') return historicalRequests;
    return historicalRequests.filter((r) => String(r.status || '').toUpperCase() === statusFilter);
  }, [historicalRequests, statusFilter]);

  const columns = useMemo(() => [
    {
      key: 'foodName',
      title: 'Food Item',
      render: (row) => (
        <div>
          <div className="font-extrabold text-[#292B29]">{row.foodName || row.donationName || 'Food Item'}</div>
          <div className="text-xs text-[#626760]">{row.pickupAddress || 'Local Location'}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (row) => (
        <span className="font-extrabold text-[#BD715C] text-xs">
          {row.quantity || row.foodId?.quantity || 1} {row.unit || row.foodId?.unit || 'servings'}
        </span>
      )
    },
    {
      key: 'donorName',
      title: 'Donor',
      render: (row) => <span className="font-semibold text-[#292B29] text-xs">{row.donorName || row.donorId?.name || 'Donor'}</span>
    },
    {
      key: 'message',
      title: 'Message',
      render: (row) => <span className="text-xs text-[#626760] line-clamp-2">{row.message || row.requestMessage || 'No notes'}</span>
    },
    {
      key: 'createdAt',
      title: 'Request Date',
      render: (row) => <span className="text-xs text-[#626760] font-medium">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</span>
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => renderStatusBadge(row.status)
    },
    {
      key: 'actions',
      title: 'Action',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/ngo/food/${row.foodId?._id || row.foodId}`)} className="gap-1 text-xs px-3 py-1.5">
          <FiEye className="h-3.5 w-3.5" />
          <span>View Item</span>
        </Button>
      )
    }
  ], [navigate]);

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Request History Logs"
        subtitle="Complete log of your accepted and rejected food requests"
      />

      <Card icon={<FiClock className="h-5 w-5 text-[#BD715C]" />} title="Historical Records">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6DED6]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#292B29]">Filter by Status</div>
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'ACCEPTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-[#BD715C] text-white shadow-xs'
                    : 'border border-[#E6DED6] bg-white text-[#626760] hover:bg-[#FAF7F2]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Spinner size={44} /></div>
        ) : error ? (
          <EmptyState description={error} action={<Button onClick={load}>Retry</Button>} />
        ) : !Array.isArray(filteredRequests) || filteredRequests.length === 0 ? (
          <EmptyState title="No History Records" description="No request history found matching your filter criteria." />
        ) : (
          <DataTable
            columns={columns}
            data={filteredRequests}
            rowsPerPage={10}
            searchPlaceholder="Search history by food item or donor..."
          />
        )}
      </Card>
    </section>
  );
};

export default RequestHistory;
