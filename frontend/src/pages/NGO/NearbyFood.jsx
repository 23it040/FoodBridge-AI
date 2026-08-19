import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import donationService from '../../services/donation.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import LeafletMap from '../../components/maps/LeafletMap';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useForm } from 'react-hook-form';
import { FiSearch, FiFilter, FiMapPin, FiEye } from 'react-icons/fi';

const NearbyFood = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donations, setDonations] = useState([]);
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { q: '', category: '', sortBy: '' }
  });

  const load = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await donationService.listDonations(params);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const available = list.filter((d) => !d.status || d.status === 'AVAILABLE' || d.status === 'available');
      setDonations(available);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch nearby food donations.');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSearch = (values) => {
    const params = {};
    if (values.q) params.q = values.q;
    if (values.category) params.category = values.category;
    if (values.sortBy) params.sortBy = values.sortBy;
    load(params);
  };

  const onClear = () => {
    reset({ q: '', category: '', sortBy: '' });
    load();
  };

  const columns = useMemo(() => [
    {
      key: 'image',
      title: 'Food Listing',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.foodImage?.url || row.imageUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop'}
            alt={row.foodName || row.name}
            className="h-12 w-12 rounded-xl object-cover border border-[#89D7B7]/60 shadow-xs"
          />
          <div>
            <div className="font-extrabold text-[#1A312C] text-sm">{row.foodName || row.name}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <FiMapPin className="h-3 w-3 text-[#428475]" />
              <span>{row.pickupAddress || 'Local Area'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (row) => <Badge variant="secondary">{row.category || 'General'}</Badge>
    },
    {
      key: 'quantity',
      title: 'Quantity',
      render: (row) => <span className="font-bold text-[#428475]">{row.quantity} {row.unit || 'servings'}</span>
    },
    {
      key: 'donorName',
      title: 'Donor',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{row.donorName || row.donorId?.name || 'Verified Donor'}</span>
    },
    {
      key: 'actions',
      title: 'Action',
      render: (row) => (
        <Button
          size="sm"
          onClick={() => navigate(`/ngo/food/${row._id || row.id}`)}
          className="gap-1 text-xs px-3 py-1.5"
        >
          <FiEye className="h-3.5 w-3.5" />
          <span>View Details</span>
        </Button>
      )
    }
  ], [navigate]);

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Nearby Available Food"
        subtitle="Explore fresh surplus food posted by local donors ready for NGO claim"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Surplus Listings" icon={<FiSearch className="h-5 w-5" />}>
            <form onSubmit={handleSubmit(onSearch)} className="mb-6 flex flex-wrap items-center gap-2.5 bg-[#FFF4E1]/40 p-3 rounded-2xl border border-[#89D7B7]">
              <input
                {...register('q')}
                placeholder="Search food name..."
                className="flex-1 min-w-[160px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-[#1A312C] outline-none focus:border-[#428475]"
              />
              <input
                {...register('category')}
                placeholder="Category (e.g. Cooked)"
                className="w-36 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-[#1A312C] outline-none focus:border-[#428475]"
              />
              <Button type="submit" size="sm" className="gap-1">
                <FiFilter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onClear} className="bg-white text-slate-600 border-slate-200">
                Clear
              </Button>
            </form>

            {loading ? (
              <div className="py-12 text-center"><Spinner size={44} /></div>
            ) : error ? (
              <EmptyState description={error} action={<Button onClick={() => load()}>Retry</Button>} />
            ) : !Array.isArray(donations) || donations.length === 0 ? (
              <EmptyState title="No Food Found" description="No available food donations found near your location." />
            ) : (
              <DataTable columns={columns} data={donations} rowsPerPage={10} showSearch={false} />
            )}
          </Card>
        </div>

        <div>
          <Card title="Donation Locations Map" icon={<FiMapPin className="h-5 w-5" />}>
            <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
              <LeafletMap
                key={`nearby-food-map-${donations.length}`}
                markers={(donations || [])
                  .filter((d) => d.latitude || d.longitude)
                  .map((d) => ({
                    id: d._id || d.id,
                    type: 'donation',
                    position: [Number(d.latitude || 28.6139), Number(d.longitude || 77.2090)],
                    foodName: d.foodName || d.name,
                    quantity: d.quantity,
                    unit: d.unit,
                    expiryTime: d.expiryTime,
                    detailsUrl: `/ngo/food/${d._id || d.id}`
                  }))}
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NearbyFood;
