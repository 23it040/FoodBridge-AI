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
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { FiPlusCircle, FiEye, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const MyDonations = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const [deletingDonation, setDeletingDonation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  useEffect(() => {
    load();
  }, []);

  const handleView = (row) => navigate(`/donor/donations/${row._id || row.id}`);

  const handleOpenDeleteModal = (row) => {
    setDeletingDonation(row);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeletingDonation(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDonation || isDeleting) return;
    const donationId = deletingDonation._id || deletingDonation.id;
    if (!donationId) return;

    setIsDeleting(true);
    try {
      await donationService.deleteDonation(donationId);
      toast.success('Donation deleted successfully');
      setDeletingDonation(null);
      load();
    } catch (error) {
      console.error('Delete donation error:', error);
      const errMsg = error?.response?.data?.message || 'Unable to delete this donation. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'foodName',
      title: 'Food Item',
      render: (row) => (
        <div>
          <div className="font-extrabold text-[#102A2A]">{row.foodName || row.name || row.title || 'Food Item'}</div>
          <div className="text-xs text-[#687370]">{row.pickupAddress || 'Address N/A'}</div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (row) => <span className="font-semibold text-[#102A2A]">{row.category || 'General'}</span>
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (row) => <span className="font-bold text-[#2F8F72]">{row.quantity} {row.unit || 'servings'}</span>
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDeleteModal(row)}
            className="text-red-600 hover:bg-red-50"
            title="Delete Donation"
          >
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

      {/* Custom FoodBridge Delete Confirmation Modal */}
      <ConfirmationDialog
        open={Boolean(deletingDonation)}
        title="Delete Donation?"
        description="Are you sure you want to delete this food donation? This action cannot be undone."
        confirmLabel="Delete Donation"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
      >
        {deletingDonation && (
          <div className="mt-3 rounded-2xl border border-[#DDE5E1] bg-[#E8F6F0]/40 p-3.5 space-y-1.5 text-xs text-[#102A2A] font-sans">
            <div className="flex items-center justify-between border-b border-[#DDE5E1] pb-1.5">
              <span className="font-extrabold text-sm text-[#102A2A]">
                {deletingDonation.foodName || deletingDonation.name || deletingDonation.title || 'Food Item'}
              </span>
              <Badge variant={deletingDonation.status === 'AVAILABLE' || deletingDonation.status === 'available' ? 'success' : 'default'}>
                {deletingDonation.status || 'AVAILABLE'}
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-1 text-[#687370] font-medium">
              <span>Category: <strong>{deletingDonation.category || 'General'}</strong></span>
              <span>Quantity: <strong className="text-[#2F8F72]">{deletingDonation.quantity} {deletingDonation.unit || 'servings'}</strong></span>
            </div>
            {deletingDonation.pickupAddress && (
              <p className="text-[11px] text-[#687370] truncate pt-1">
                Pickup: {deletingDonation.pickupAddress}
              </p>
            )}
          </div>
        )}
      </ConfirmationDialog>
    </section>
  );
};

export default MyDonations;
