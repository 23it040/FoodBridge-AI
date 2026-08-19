import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../../services/analytics.service';
import donationService from '../../services/donation.service';
import requestService from '../../services/request.service';
import aiService from '../../services/ai.service';
import { normalizeListResponse, normalizeObjectResponse } from '../../utils/normalizeApiResponse';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiBox, FiCheckCircle, FiClock, FiHeart, FiPlusCircle, FiTruck, FiAlertTriangle, FiRefreshCw, FiTrendingUp, FiInfo, FiAward } from 'react-icons/fi';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [demandInsight, setDemandInsight] = useState(null);
  const [demandLoading, setDemandLoading] = useState(false);
  const [priorityInsight, setPriorityInsight] = useState(null);
  const navigate = useNavigate();

  const loadDonorDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, donationsRes, requestsRes] = await Promise.all([
        analyticsService.getDonorAnalytics(),
        donationService.getMyDonations({ limit: 5 }),
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

  useEffect(() => {
    loadDonorDashboard();

    let mounted = true;
    const fetchAI = async () => {
      setDemandLoading(true);
      try {
        const res = await aiService.predictDemand({
          food_category: 'Rice Bowl',
          center_type: 'TYPE_A',
          op_area: 5.0,
          previous_donations: 150
        });
        if (mounted) setDemandInsight(res?.data || res);
      } catch (e) {
        if (mounted) setDemandInsight({ insufficientData: true, message: 'Demand prediction requires more real historical FoodBridge data.' });
      } finally {
        if (mounted) setDemandLoading(false);
      }

      try {
        const pRes = await aiService.priorityScore({ food_category: 'Rice Bowl' });
        if (mounted) setPriorityInsight(pRes?.data || pRes);
      } catch (e) {
        if (mounted) setPriorityInsight({ insufficientData: true, message: 'AI priority prediction unavailable because sufficient FoodBridge historical data has not yet been collected.' });
      }
    };
    fetchAI();
    return () => (mounted = false);
  }, [loadDonorDashboard]);

  const statItems = [
    { label: 'Total Donations', value: stats?.totalDonations ?? 0, icon: <FiBox className="h-6 w-6" /> },
    { label: 'Available Items', value: stats?.availableItems ?? stats?.availableDonations ?? 0, icon: <FiHeart className="h-6 w-6" /> },
    { label: 'Accepted Requests', value: stats?.acceptedRequests ?? 0, icon: <FiTruck className="h-6 w-6" /> },
    { label: 'Completed Deliveries', value: stats?.completedDeliveries ?? stats?.completedDonations ?? 0, icon: <FiCheckCircle className="h-6 w-6" /> },
    { label: 'Pending Requests', value: stats?.pendingRequests ?? 0, icon: <FiClock className="h-6 w-6" /> }
  ];

  const monthChartData = Array.isArray(stats?.donationsByMonth) && stats.donationsByMonth.length > 0
    ? stats.donationsByMonth
    : [];

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
            <Button onClick={() => navigate('/ai/demand')} variant="outline" className="gap-2 text-xs">
              <span>View Regional Demand</span>
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                      <div className="font-semibold text-[#1A312C]">{r.foodName || r.name || 'Food Item'}</div>
                    )
                  },
                  {
                    key: 'quantity',
                    title: 'Quantity',
                    render: (r) => <span className="font-medium text-slate-700">{r.quantity} {r.unit || ''}</span>
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (r) => <Badge variant={r.status === 'AVAILABLE' ? 'success' : 'default'}>{r.status || 'AVAILABLE'}</Badge>
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
                  { key: 'ngoName', title: 'NGO Partner', render: (r) => <span className="font-bold text-[#1A312C]">{r.ngoId?.name || r.ngoName || 'NGO'}</span> },
                  { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'ACCEPTED' ? 'success' : 'warning'}>{r.status || 'PENDING'}</Badge> }
                ]}
                data={recentRequests}
                showSearch={false}
                emptyMessage="No incoming requests yet."
              />
            </Card>

            <div className="space-y-6">
              <Card title="AI Demand Insights" icon={<FiTrendingUp className="h-5 w-5" />}>
                {demandLoading ? (
                  <div className="py-8 text-center"><Spinner size={24} /></div>
                ) : demandInsight?.insufficientData ? (
                  <div className="py-6 text-center text-xs text-amber-700 space-y-2">
                    <FiInfo className="h-6 w-6 text-amber-600 mx-auto" />
                    <p>Demand prediction requires more real historical FoodBridge data.</p>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold uppercase text-[10px]">Target Category:</span>
                      <span className="font-bold text-[#1A312C]">Rice Bowl</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold uppercase text-[10px]">Predicted Demand:</span>
                      <span className="text-lg font-extrabold text-[#428475]">{Math.round(demandInsight?.prediction ?? demandInsight?.expected_meals ?? 0)} meals</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div><span className="font-semibold">Model:</span> Gradient Boosting</div>
                      <div><span className="font-semibold">Test R²:</span> 58.74%</div>
                      <div><span className="font-semibold">Model Status:</span> <span className="font-mono text-amber-700">{demandInsight?.modelStatus || 'EXTERNAL_DATA_MODEL'}</span></div>
                      <div><span className="font-semibold">Data Source:</span> Kaggle</div>
                    </div>
                  </div>
                )}
              </Card>

              {/* AI Donation Priority Card */}
              <Card title="AI Donation Priority" icon={<FiAward className="h-5 w-5" />}>
                {priorityInsight?.insufficientData ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 text-center">
                    <FiInfo className="h-6 w-6 text-amber-600 mx-auto" />
                    <p>AI priority prediction unavailable because sufficient FoodBridge historical data has not yet been collected.</p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#1A312C]">Priority Score: {priorityInsight?.priorityScore}</span>
                      <Badge variant="success">{priorityInsight?.priorityLevel}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-600">Model Status: {priorityInsight?.modelStatus}</div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Dashboard;
