import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import donationService from '../../services/donation.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiPlusCircle, FiEye, FiTrash2 } from 'react-icons/fi';

const MyDonations = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await donationService.getMyDonations({ page: 1, limit: 50 });
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setDonations(list);
    } catch (error) {
      console.error(error);
      setError('Failed to load your donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleView = (row) => navigate(`/donor/donations/${row._id || row.id}`);

  const handleDelete = async (row) => {
    const donationId = row._id || row.id;
    if (!donationId || !window.confirm('Remove this donation listing?')) return;
    setDeletingId(donationId);
    try {
      await donationService.deleteDonation(donationId);
      toast.success('Donation removed successfully');
      load();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete donation');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'foodName',
      title: 'Food Item',
      render: (row) => (
        <div>
          <div className="font-extrabold text-[#1A312C]">{row.foodName || row.name || row.title || 'Food Item'}</div>
          <div className="text-xs text-slate-500">{row.pickupAddress || 'Address N/A'}</div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (row) => <span className="font-semibold text-slate-700">{row.category || 'General'}</span>
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (row) => <span className="font-bold text-[#428475]">{row.quantity} {row.unit || 'servings'}</span>
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => <Badge variant={row.status === 'AVAILABLE' || row.status === 'available' ? 'success' : 'default'}>{row.status || 'AVAILABLE'}</Badge>
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleView(row)} className="gap-1 text-xs">
            <FiEye className="h-3.5 w-3.5" />
            <span>Details</span>
          </Button>
          <Button size="sm" variant="ghost" loading={deletingId === (row._id || row.id)} disabled={Boolean(deletingId)} onClick={() => handleDelete(row)} className="text-red-600 hover:bg-red-50">
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="My Food Donations"
        subtitle="Manage and track active and past surplus food listings"
        actions={
          <Button onClick={() => navigate('/donor/donate')} className="gap-2">
            <FiPlusCircle className="h-4 w-4" />
            <span>Donate Surplus Food</span>
          </Button>
        }
      />
      <Card>
        {loading ? (
          <div className="py-12 text-center"><Spinner size={44} /></div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-red-600">
            <p>{error}</p>
            <Button variant="outline" className="mt-3" onClick={load}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={donations} loading={loading} rowsPerPage={10} searchPlaceholder="Search donations by name or category..." />
        )}
      </Card>
    </section>
  );
};

export default MyDonations;
