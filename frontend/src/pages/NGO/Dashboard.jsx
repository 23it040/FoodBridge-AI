import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../../services/analytics.service';
import requestService from '../../services/request.service';
import ngoService from '../../services/ngo.service';
import donationService from '../../services/donation.service';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';
import { normalizeCoordinates } from '../../services/map.service';
import { normalizeListResponse, normalizeObjectResponse } from '../../utils/normalizeApiResponse';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import BarChart from '../../components/charts/BarChart';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import NGOMap from '../../components/maps/NGOMap';
import toast from 'react-hot-toast';
import {
  FiHeart,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiSearch,
  FiAlertTriangle,
  FiRefreshCw,
  FiMapPin,
  FiNavigation,
  FiCpu,
  FiPackage,
  FiEye,
  FiArrowRight
} from 'react-icons/fi';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const parseCoords = (item) => {
  if (!item) return null;
  const lat = Number(item.latitude ?? item.lat ?? item.position?.[0] ?? item.position?.lat ?? item.location?.coordinates?.[1]);
  const lng = Number(item.longitude ?? item.lng ?? item.position?.[1] ?? item.position?.lng ?? item.location?.coordinates?.[0]);
  if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [recentRequests, setRecentRequests] = useState([]);
  const [nearbyNgos, setNearbyNgos] = useState([]);
  const [nearbyFood, setNearbyFood] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  const {
    location: deviceLocation,
    loading: locating,
    errorMessage: locationError,
    requestLocation
  } = useGeolocation(false);

  const savedNgoLocation = useMemo(() => {
    if (!user) return null;
    return normalizeCoordinates(user);
  }, [user]);

  const activeNgoLocation = deviceLocation || savedNgoLocation;

  const loadNgoDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, requestsRes, ngosRes, donationsRes] = await Promise.all([
        analyticsService.getNgoAnalytics(),
        requestService.listRequests({ limit: 5 }),
        ngoService.getNgosForMap({ includeDemo: true }),
        donationService.listDonations({ status: 'AVAILABLE' }).catch(() => [])
      ]);

      const data = normalizeObjectResponse(analyticsRes);
      const rawStats = data?.stats || data || {};
      setStats({
        ...rawStats,
        requestsByMonth: data.requestsByMonth || [],
        statusBreakdown: data.statusBreakdown || []
      });

      const requests = normalizeListResponse(requestsRes, ['requests', 'items']);
      setRecentRequests(requests);

      const ngosList = Array.isArray(ngosRes) ? ngosRes : Array.isArray(ngosRes?.data) ? ngosRes.data : [];
      setNearbyNgos(ngosList);

      const foodList = Array.isArray(donationsRes) ? donationsRes : Array.isArray(donationsRes?.data) ? donationsRes.data : [];
      setNearbyFood(foodList);
    } catch (err) {
      console.error('Failed to load NGO dashboard:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load NGO dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNgoDashboard();
  }, [loadNgoDashboard]);

  const handleUseMyLocation = () => {
    requestLocation()
      .then(() => toast.success('Current device location updated!'))
      .catch((err) => toast.error(err.message || 'Failed to detect location.'));
  };

  const filteredNgos = useMemo(() => {
    if (!user) return nearbyNgos;
    const currentId = String(user._id || user.id);
    return nearbyNgos.filter((n) => String(n._id || n.id) !== currentId);
  }, [nearbyNgos, user]);

  const matchedFoodList = useMemo(() => {
    if (!Array.isArray(nearbyFood) || nearbyFood.length === 0) return [];
    const ngoPos = activeNgoLocation ? parseCoords(activeNgoLocation) : null;
    const ngoCap = user?.capacity || 100;

    return nearbyFood
      .filter((food) => {
        if (food.status === 'EXPIRED') return false;
        if (food.expiryTime && new Date(food.expiryTime) <= new Date()) return false;
        return true;
      })
      .map((food) => {
        const foodPos = parseCoords(food);
        const dist = (ngoPos && foodPos)
          ? calculateDistance(ngoPos.lat, ngoPos.lng, foodPos.lat, foodPos.lng)
          : (food.distance ? Math.round(food.distance * 10) / 10 : null);

        if (dist === null) {
          return {
            ...food,
            locationAvailable: false,
            calculatedDistance: null,
            matchScore: 15,
            score: 15,
            matchLevel: 'NOT RECOMMENDED',
            badgeVariant: 'danger',
            reasons: ['✕ Pickup location coordinates missing']
          };
        }

        let distPts = 10;
        if (dist <= 5) distPts = 100;
        else if (dist <= 10) distPts = 90;
        else if (dist <= 15) distPts = 75;
        else if (dist <= 20) distPts = 60;
        else if (dist <= 25) distPts = 45;
        else if (dist <= 30) distPts = 35;
        else if (dist <= 40) distPts = 25;
        else if (dist <= 50) distPts = 15;

        const qty = food.quantity || 1;
        let capPts = 100;
        if (qty > ngoCap) {
          const ratio = qty / ngoCap;
          if (ratio <= 1.25) capPts = 80;
          else if (ratio <= 1.5) capPts = 60;
          else if (ratio <= 2.0) capPts = 40;
          else capPts = 20;
        }

        const catPts = 90;

        let qtyPts = 50;
        if (qty >= 50) qtyPts = 100;
        else if (qty >= 20) qtyPts = 85;
        else if (qty >= 10) qtyPts = 70;

        let urgPts = 50;
        if (food.expiryTime) {
          const hoursLeft = (new Date(food.expiryTime) - new Date()) / (1000 * 60 * 60);
          if (hoursLeft <= 3) urgPts = 100;
          else if (hoursLeft <= 6) urgPts = 90;
          else if (hoursLeft <= 12) urgPts = 75;
          else if (hoursLeft <= 24) urgPts = 60;
        }

        const baseScore = (distPts * 0.45) + (capPts * 0.25) + (catPts * 0.15) + (qtyPts * 0.10) + (urgPts * 0.05);

        let finalScore = baseScore;
        if (dist > 100) {
          finalScore = Math.min(finalScore, 20);
          finalScore = Math.max(10, Math.min(20, finalScore));
        } else if (dist > 50) {
          finalScore = Math.min(finalScore, 30);
          finalScore = Math.max(10, Math.min(30, finalScore));
        } else if (dist > 40) {
          finalScore = Math.min(finalScore, 35);
        } else if (dist > 30) {
          finalScore = Math.min(finalScore, 45);
        } else if (dist > 20) {
          finalScore = Math.min(finalScore, 55);
        }

        const roundedScore = Math.round(Math.max(10, Math.min(100, finalScore)));

        let matchLevel = 'NOT RECOMMENDED';
        let badgeVariant = 'danger';

        if (roundedScore >= 80) {
          matchLevel = 'HIGH MATCH';
          badgeVariant = 'success';
        } else if (roundedScore >= 60) {
          matchLevel = 'RECOMMENDED';
          badgeVariant = 'info';
        } else if (roundedScore >= 36) {
          matchLevel = 'LOW MATCH';
          badgeVariant = 'warning';
        }

        const reasons = [];
        if (capPts >= 80) reasons.push('✓ Capacity compatible');
        if (catPts >= 80) reasons.push('✓ Food category compatible');
        if (dist <= 10) {
          reasons.push(`✓ Nearby pickup (${dist.toFixed(1)} km)`);
        } else if (dist > 40) {
          reasons.push(`✕ Pickup distance ${dist.toFixed(1)} km (Impractical)`);
        } else {
          reasons.push(`✕ Pickup distance ${dist.toFixed(1)} km`);
        }

        return {
          ...food,
          calculatedDistance: dist,
          distanceKm: dist,
          matchScore: roundedScore,
          score: roundedScore,
          matchLevel,
          badgeVariant,
          reasons
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [nearbyFood, activeNgoLocation, user]);

  const statItems = [
    { label: 'Total Requests', value: stats?.totalRequests ?? 0, icon: <FiHeart className="h-6 w-6" /> },
    { label: 'Pending Approval', value: stats?.pendingApproval ?? stats?.pendingRequests ?? 0, icon: <FiClock className="h-6 w-6" /> },
    { label: 'Approved Pickups', value: stats?.approvedPickups ?? stats?.acceptedRequests ?? 0, icon: <FiTruck className="h-6 w-6" /> },
    { label: 'Completed Claims', value: stats?.completedClaims ?? stats?.completedRequests ?? 0, icon: <FiCheckCircle className="h-6 w-6" /> },
    { label: 'Meals Distributed', value: stats?.mealsDistributed ?? stats?.totalMealsCollected ?? 0, icon: <FiCheckCircle className="h-6 w-6" /> }
  ];

  const monthChartData = Array.isArray(stats?.requestsByMonth) && stats.requestsByMonth.length > 0
    ? stats.requestsByMonth
    : [];

  return (
    <section className="space-y-6 py-6">
      <PageHeader
        title="NGO Partner Dashboard"
        subtitle="Browse surplus food, request items, and manage food collection logistics"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate('/ngo/nearby-food')} className="gap-2 text-xs">
              <FiSearch className="h-4 w-4" />
              <span>Find Nearby Food</span>
            </Button>
            <Button onClick={loadNgoDashboard} variant="outline" className="gap-2 text-xs">
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size={48} />
          <p className="text-xs font-semibold text-slate-500">Calculating NGO partner metrics & AI matching from database...</p>
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
          <Button onClick={loadNgoDashboard} className="mx-auto text-xs px-5 py-2">
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

          {/* Real Operational AI Logistics Matching Section */}
          <Card
            title="Recommended Surplus Food (AI Logistics Matching)"
            description="Operational matching algorithm ranking real available surplus food based on your location, capacity, and urgency"
            icon={<FiCpu className="h-5 w-5 text-indigo-600" />}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/ngo/nearby-food')}
                className="gap-1.5 text-xs py-1.5"
              >
                <span>Browse All ({nearbyFood.length})</span>
                <FiArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          >
            {matchedFoodList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <FiPackage className="h-10 w-10 mx-auto text-slate-400" />
                <p className="text-sm font-semibold">No available surplus food donations found nearby right now.</p>
                <p className="text-xs text-slate-400">Check back soon or refresh to see new donor listings as they arrive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedFoodList.slice(0, 6).map((food) => {
                  const isSelected = selectedFood && (selectedFood._id === food._id || selectedFood.id === food.id);
                  return (
                    <div
                      key={food._id || food.id}
                      className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant={food.badgeVariant} className="text-[10px] font-extrabold uppercase px-2 py-0.5">
                            {food.matchLevel} ({food.matchScore}%)
                          </Badge>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {food.category || 'Surplus Food'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-sm text-[#1A312C] line-clamp-1">
                            {food.foodName || food.name || 'Surplus Food Listing'}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            Donor: <span className="font-medium text-slate-700">{food.donorId?.name || food.donorName || 'Verified Donor'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <FiPackage className="h-3.5 w-3.5 text-emerald-600" />
                            {food.quantity} {food.unit || 'servings'}
                          </span>
                          {food.calculatedDistance !== null && (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <FiMapPin className="h-3.5 w-3.5 text-indigo-500" />
                              {food.calculatedDistance} km away
                            </span>
                          )}
                        </div>

                        {/* Explainable match reasons */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {food.reasons.map((reason, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-slate-100 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFood(food);
                            document.getElementById('ngo-dashboard-map-container')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="flex-1 text-xs py-1.5 gap-1 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                        >
                          <FiMapPin className="h-3.5 w-3.5" />
                          <span>View Pin</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => navigate(`/ngo/food/${food._id || food.id}`)}
                          className="flex-1 text-xs py-1.5 gap-1 bg-[#047857] hover:bg-[#065F46] text-white"
                        >
                          <FiEye className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Interactive Google Map Section */}
          <div id="ngo-dashboard-map-container">
            <Card
              title="NGO Network & Food Pickup Map"
              description="Interactive map displaying your location, verified FoodBridge partner NGOs, and nearby surplus food donations"
              icon={<FiMapPin className="h-5 w-5 text-[#428475]" />}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUseMyLocation}
                  loading={locating}
                  className="gap-1.5 text-xs py-1.5"
                >
                  <FiNavigation className="h-3.5 w-3.5 text-[#428475]" />
                  <span>Use My Location</span>
                </Button>
              }
            >
              {locationError && (
                <div className="mb-[#3px] p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                  {locationError}
                </div>
              )}
              <div className="overflow-hidden rounded-2xl border border-[#89D7B7]">
                <NGOMap
                  pickupLocation={activeNgoLocation}
                  initialNgos={filteredNgos}
                  foodDonations={nearbyFood}
                  selectedFood={selectedFood}
                  onSelectFood={setSelectedFood}
                  onViewNgo={() => navigate('/ngo/nearby-food')}
                  className="h-[380px]"
                />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card
              title="Recent Food Requests"
              description="Status of food donation requests"
              action={
                <Button size="sm" variant="ghost" onClick={() => navigate('/ngo/my-requests')}>
                  View All
                </Button>
              }
              className="lg:col-span-2"
            >
              <DataTable
                columns={[
                  {
                    key: 'foodName',
                    title: 'Food Item',
                    render: (r) => (
                      <div>
                        <div className="font-bold text-[#1A312C]">{r.foodId?.foodName || r.foodName || 'Food Item'}</div>
                        <div className="text-xs text-slate-500">{r.donorId?.name || r.donorName || 'Donor'}</div>
                      </div>
                    )
                  },
                  {
                    key: 'pickupTime',
                    title: 'Pickup Time',
                    render: (r) => <span className="text-xs font-semibold text-slate-700">{r.pickupTime || 'Flexible'}</span>
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (r) => <Badge variant={r.status === 'ACCEPTED' ? 'success' : 'warning'}>{r.status || 'PENDING'}</Badge>
                  }
                ]}
                data={recentRequests}
                showSearch={false}
                emptyMessage="No food requests submitted yet."
              />
            </Card>

            <Card title="Monthly Activity">
              {monthChartData.length > 0 ? (
                <BarChart data={monthChartData} dataKey="count" nameKey="month" />
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">No monthly activity recorded yet.</div>
              )}
            </Card>
          </div>
        </>
      )}
    </section>
  );
};

export default Dashboard;
