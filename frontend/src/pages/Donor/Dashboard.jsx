import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../../services/analytics.service';
import donationService from '../../services/donation.service';
import requestService from '../../services/request.service';
import ngoService from '../../services/ngo.service';
import useAuth from '../../hooks/useAuth';
import { useLocationContext } from '../../context/LocationContext';
import { discoverNearbyNGOs } from '../../services/ngoDiscovery.service';
import { normalizeCoordinates } from '../../services/map.service';
import { normalizeListResponse, normalizeObjectResponse } from '../../utils/normalizeApiResponse';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import NGOMap from '../../components/maps/NGOMap';
import toast from 'react-hot-toast';
import {
  FiBox,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiPlusCircle,
  FiTruck,
  FiAlertTriangle,
  FiRefreshCw,
  FiMapPin,
  FiNavigation,
  FiActivity
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [nearbyNgos, setNearbyNgos] = useState([]);

  const {
    currentLocation: deviceLocation,
    locationLoading: locating,
    errorMessage: locationError,
    requestCurrentLocation
  } = useLocationContext();

  const savedDonorLocation = useMemo(() => {
    if (!user) return null;
    return normalizeCoordinates(user);
  }, [user]);

  const activeDonorLocation = deviceLocation || savedDonorLocation;

  const loadDonorDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, donationsRes, requestsRes] = await Promise.all([
        analyticsService.getDonorAnalytics(),
        donationService.getMyDonations({ limit: 10 }),
        requestService.listRequests({ limit: 5 })
      ]);

      const data = normalizeObjectResponse(analyticsRes);
      const rawStats = data?.stats || data || {};
      setStats({
        ...rawStats,
        donationsByMonth: data.donationsByMonth || [],
        statusBreakdown: data.statusBreakdown || []
      });

      const donations = normalizeListResponse(donationsRes, ['donations', 'items']);
      setRecentDonations(donations);

      const requests = normalizeListResponse(requestsRes, ['requests', 'items']);
      setRecentRequests(requests);
    } catch (err) {
      console.error('Failed to load donor dashboard:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load donor dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearbyNgos = useCallback(async (location) => {
    if (!location) {
      setNearbyNgos([]);
      return;
    }
    try {
      const res = await discoverNearbyNGOs({
        location,
        radiusMeters: 15000
      });
      setNearbyNgos(res.ngos || []);
    } catch (err) {
      console.warn('Failed to discover nearby NGOs for donor:', err);
    }
  }, []);

  useEffect(() => {
    loadDonorDashboard();
  }, [loadDonorDashboard]);

  useEffect(() => {
    if (activeDonorLocation) {
      fetchNearbyNgos(activeDonorLocation);
    }
  }, [activeDonorLocation, fetchNearbyNgos]);

  const handleUseMyLocation = () => {
    requestCurrentLocation()
      .then((loc) => {
        toast.success('Current device location updated!');
        if (loc) fetchNearbyNgos(loc);
      })
      .catch((err) => toast.error(err.message || 'Failed to detect location.'));
  };

  const statItems = [
    { label: 'Total Donations', value: stats?.totalDonations ?? 0, icon: <FiBox className="h-6 w-6" /> },
    { label: 'Available Items', value: stats?.availableItems ?? stats?.availableDonations ?? 0, icon: <FiHeart className="h-6 w-6" /> },
    { label: 'Accepted Requests', value: stats?.acceptedRequests ?? 0, icon: <FiTruck className="h-6 w-6" /> },
    { label: 'Completed Deliveries', value: stats?.completedDeliveries ?? stats?.completedDonations ?? 0, icon: <FiCheckCircle className="h-6 w-6" /> },
    { label: 'Pending Requests', value: stats?.pendingRequests ?? 0, icon: <FiClock className="h-6 w-6" /> }
  ];

  const mapDonationMarkers = useMemo(() => {
    return recentDonations
      .map((d) => {
        const coords = normalizeCoordinates(d);
        if (!coords) return null;
        return {
          id: d._id || d.id,
          foodName: d.foodName || d.name,
          category: d.category,
          quantity: d.quantity,
          unit: d.unit,
          address: d.pickupAddress,
          latitude: coords.lat,
          longitude: coords.lng,
          status: d.status
        };
      })
      .filter(Boolean);
  }, [recentDonations]);

  return (
    <section className="space-y-6 py-6">
      <PageHeader
        title="Donor Dashboard"
        subtitle="Manage food listings, review NGO requests, and track social impact"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate('/donor/donate')} className="gap-2 text-xs">
              <FiPlusCircle className="h-4 w-4" />
              <span>Donate Surplus Food</span>
            </Button>
            <Button onClick={loadDonorDashboard} variant="outline" className="gap-2 text-xs">
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size={48} />
          <p className="text-xs font-semibold text-slate-500">Calculating donor metrics from database...</p>
        </div>
      ) : error ? (
        <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
          <div className="flex justify-center text-red-500">
            <FiAlertTriangle className="h-10 w-10" />
          </div>
          <div>
            <h4 className="font-extrabold text-red-800 text-sm">Unable to load dashboard statistics</h4>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={loadDonorDashboard} className="mx-auto text-xs px-5 py-2">
            Retry Loading
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statItems.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
            ))}
          </div>

          {/* Interactive Google Map Section */}
          <Card
            title="Pickup & Nearby NGOs Map"
            description="Interactive map displaying your location, verified FoodBridge partner NGOs, and active food donation points"
            icon={<FiMapPin className="h-5 w-5 text-[#BD715C]" />}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={handleUseMyLocation}
                loading={locating}
                className="gap-1.5 text-xs py-1.5"
              >
                <FiNavigation className="h-3.5 w-3.5 text-[#BD715C]" />
                <span>Use My Location</span>
              </Button>
            }
          >
            {locationError && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                {locationError}
              </div>
            )}
            <div className="overflow-hidden rounded-2xl border border-[#E6DED6]">
              <NGOMap
                pickupLocation={activeDonorLocation}
                initialNgos={nearbyNgos}
                foodDonations={mapDonationMarkers}
                className="h-[380px]"
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card
              title="Recent Food Donations"
              description="Your latest posted surplus items"
              action={
                <Button size="sm" variant="ghost" onClick={() => navigate('/donor/my-donations')}>
                  View All
                </Button>
              }
            >
              <DataTable
                columns={[
                  {
                    key: 'foodName',
                    title: 'Food Item',
                    render: (r) => (
                      <div
                        className="font-semibold text-[#292B29] hover:text-[#BD715C] cursor-pointer transition-colors"
                        onClick={() => navigate(`/donor/donations/${r._id || r.id}`)}
                      >
                        {r.foodName || r.name || 'Food Item'}
                      </div>
                    )
                  },
                  {
                    key: 'quantity',
                    title: 'Quantity',
                    render: (r) => <span className="font-medium text-[#626760]">{r.quantity} {r.unit || ''}</span>
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (r) => <Badge variant={r.status === 'AVAILABLE' ? 'success' : 'default'}>{r.status || 'AVAILABLE'}</Badge>
                  },
                  {
                    key: 'actions',
                    title: 'Action',
                    render: (r) => (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => navigate(`/donor/donations/${r._id || r.id}`)}
                        className="text-[11px] py-1 px-2.5 gap-1 border-[#BD715C]/40 text-[#BD715C] hover:bg-[#F3DED6]/40"
                      >
                        <FiActivity className="h-3 w-3" />
                        <span>AI Risk</span>
                      </Button>
                    )
                  }
                ]}
                data={recentDonations}
                showSearch={false}
                emptyMessage="No recent food donations posted."
              />
            </Card>

            <Card
              title="Incoming NGO Requests"
              description="Requests from non-profit partners"
              action={
                <Button size="sm" variant="ghost" onClick={() => navigate('/donor/requests')}>
                  View All
                </Button>
              }
            >
              <DataTable
                columns={[
                  { key: 'ngoName', title: 'NGO Partner', render: (r) => <span className="font-bold text-[#292B29]">{r.ngoId?.name || r.ngoName || 'NGO'}</span> },
                  { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'ACCEPTED' ? 'success' : 'warning'}>{r.status || 'PENDING'}</Badge> }
                ]}
                data={recentRequests}
                showSearch={false}
                emptyMessage="No incoming requests yet."
              />
            </Card>
          </div>
        </>
      )}
    </section>
  );
};

export default Dashboard;
