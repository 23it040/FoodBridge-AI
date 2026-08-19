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

const renderStatusBadge = (status) => {
  const s = String(status || 'PENDING').toUpperCase();
  switch (s) {
    case 'ACCEPTED':
      return <Badge variant="info">Accepted</Badge>;
    case 'PICKED_UP':
      return <Badge variant="secondary">Picked Up</Badge>;
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="warning">Pending</Badge>;
  }
};

const MyRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
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
      setError('Failed to load your food requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = useMemo(() => [
    {
      key: 'foodName',
      title: 'Food Item',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{row.foodName || row.donationName || 'Food Item'}</div>
          <div className="text-xs text-slate-500">{row.pickupAddress || 'Address unavailable'}</div>
        </div>
      )
    },
    {
      key: 'donorName',
      title: 'Donor',
      render: (row) => <span className="text-slate-700 dark:text-slate-300 font-medium">{row.donorName || row.donorId?.name || 'Donor'}</span>
    },
    {
      key: 'pickupTime',
      title: 'Pickup Time',
      render: (row) => (
        <div className="text-xs">
          <div>{row.pickupDate ? new Date(row.pickupDate).toLocaleDateString() : 'Today'}</div>
          <div className="text-slate-500 font-medium">{row.pickupTime || '18:00'}</div>
        </div>
      )
    },
    {
      key: 'message',
      title: 'Message',
      render: (row) => <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{row.message || row.requestMessage || 'No message'}</span>
    },
    {
      key: 'createdAt',
      title: 'Created Date',
      render: (row) => <span className="text-xs text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}</span>
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => renderStatusBadge(row.status)
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/ngo/food/${row.foodId?._id || row.foodId}`)}>
          View Food
        </Button>
      )
    }
  ], [navigate]);

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="My Food Requests"
        subtitle="Track status of your requested food donations"
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-base font-semibold text-slate-900 dark:text-white">All Active & Recent Requests</div>
          <Button onClick={() => navigate('/ngo/request-food')}>New Request</Button>
        </div>

        {loading ? (
          <div className="py-12 text-center"><Spinner size={44} /></div>
        ) : error ? (
          <EmptyState description={error} action={<Button onClick={load}>Retry</Button>} />
        ) : !Array.isArray(requests) || requests.length === 0 ? (
          <EmptyState
            title="No requests found"
            description="You haven't requested any food donations yet. Browse nearby food to make your first request."
            action={<Button onClick={() => navigate('/ngo/nearby-food')}>Explore Nearby Food</Button>}
          />
        ) : (
          <DataTable columns={columns} data={requests} rowsPerPage={10} searchPlaceholder="Search requests by food or donor..." />
        )}
      </Card>
    </section>
  );
};

export default MyRequests;
