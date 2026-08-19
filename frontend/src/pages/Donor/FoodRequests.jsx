import { useEffect, useMemo, useState } from 'react';
import requestService from '../../services/request.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiInbox } from 'react-icons/fi';

const renderStatusBadge = (status) => {
  const s = String(status || 'PENDING').toUpperCase();
  switch (s) {
    case 'ACCEPTED':
      return <Badge variant="success">Accepted</Badge>;
    case 'PICKED_UP':
      return <Badge variant="secondary">Picked Up</Badge>;
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    default:
      return <Badge variant="warning">Pending Approval</Badge>;
  }
};

const FoodRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestService.listRequests({ page: 1, limit: 100 });
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setRequests(list);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch food requests from NGOs.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await requestService.respondToRequest(id, { status });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      load();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || `Failed to update request to ${status}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'ngoName',
      title: 'Requesting NGO',
      render: (row) => (
        <div>
          <div className="font-extrabold text-[#1A312C]">{row.ngoName || row.ngoId?.name || 'NGO Partner'}</div>
          <div className="text-xs text-slate-500">{row.ngoId?.email || 'Contact Info'}</div>
        </div>
      )
    },
    {
      key: 'foodName',
      title: 'Requested Item',
      render: (row) => <span className="font-semibold text-slate-800">{row.foodName || row.donationName || 'Food Item'}</span>
    },
    {
      key: 'message',
      title: 'Message & Details',
      render: (row) => <span className="text-xs text-slate-600 line-clamp-2">{row.message || row.requestMessage || 'No message provided'}</span>
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => renderStatusBadge(row.status)
    },
    {
      key: 'actions',
      title: 'Action',
      render: (row) => {
        if (row.status === 'PENDING') {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                disabled={updatingId === (row._id || row.id)}
                onClick={() => handleStatusChange(row._id || row.id, 'ACCEPTED')}
                className="gap-1 text-xs px-3 py-1.5"
              >
                <FiCheck className="h-3.5 w-3.5" />
                <span>Accept</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={updatingId === (row._id || row.id)}
                onClick={() => handleStatusChange(row._id || row.id, 'REJECTED')}
                className="gap-1 text-xs px-3 py-1.5 bg-white text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <FiX className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>
            </div>
          );
        }
        return <span className="text-xs font-semibold text-slate-400">Processed</span>;
      }
    }
  ], [updatingId]);

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="NGO Food Requests"
        subtitle="Review and respond to incoming pickup requests from verified non-profit partners"
      />
      <Card icon={<FiInbox className="h-5 w-5" />} title="Incoming Requests">
        {loading ? (
          <div className="py-12 text-center"><Spinner size={44} /></div>
        ) : error ? (
          <EmptyState description={error} action={<Button onClick={load}>Retry</Button>} />
        ) : !Array.isArray(requests) || requests.length === 0 ? (
          <EmptyState title="No Requests" description="No incoming NGO requests received yet." />
        ) : (
          <DataTable columns={columns} data={requests} rowsPerPage={10} searchPlaceholder="Search requests by NGO or item..." />
        )}
      </Card>
    </section>
  );
};

export default FoodRequests;
