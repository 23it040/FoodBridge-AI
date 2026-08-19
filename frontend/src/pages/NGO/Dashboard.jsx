import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import analyticsService from '../../services/analytics.service';
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
import { FiHeart, FiClock, FiCheckCircle, FiTruck, FiSearch, FiAlertTriangle, FiRefreshCw, FiTrendingUp, FiInfo } from 'react-icons/fi';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [recentRequests, setRecentRequests] = useState([]);
  const [demandForecast, setDemandForecast] = useState(null);
  const [demandLoading, setDemandLoading] = useState(false);
  const navigate = useNavigate();

  const loadNgoDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, requestsRes] = await Promise.all([
        analyticsService.getNgoAnalytics(),
        requestService.listRequests({ limit: 5 })
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
    } catch (err) {
      console.error('Failed to load NGO dashboard:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load NGO dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNgoDashboard();

    let mounted = true;
    const fetchDemand = async () => {
      setDemandLoading(true);
      try {
        const res = await aiService.predictDemand({
          food_category: 'Rice Bowl',
          center_type: 'TYPE_A',
          op_area: 5.0,
          previous_donations: 150
        });
        if (mounted) setDemandForecast(res?.data || res);
      } catch (e) {
        if (mounted) setDemandForecast({ insufficientData: true, message: 'Insufficient real FoodBridge historical demand data.' });
      } finally {
        if (mounted) setDemandLoading(false);
      }
    };
    fetchDemand();
    return () => (mounted = false);
  }, [loadNgoDashboard]);

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

  const statusChartData = Array.isArray(stats?.statusBreakdown) && stats.statusBreakdown.length > 0
    ? stats.statusBreakdown
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
            <Button onClick={() => navigate('/ai/demand')} variant="outline" className="gap-2 text-xs">
              <span>View Regional Demand</span>
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
          <p className="text-xs font-semibold text-slate-500">Calculating NGO partner metrics from database...</p>
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

            <Card title="Demand Forecast" icon={<FiTrendingUp className="h-5 w-5" />}>
              {demandLoading ? (
                <div className="py-8 text-center"><Spinner size={24} /></div>
              ) : demandForecast?.insufficientData ? (
                <div className="py-6 text-center text-xs text-amber-700 space-y-2">
                  <FiInfo className="h-6 w-6 text-amber-600 mx-auto" />
                  <p>{demandForecast.message || 'Insufficient real FoodBridge historical demand data.'}</p>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Category:</span>
                    <span className="font-bold text-[#1A312C]">Rice Bowl</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Predicted Demand:</span>
                    <span className="text-lg font-extrabold text-[#428475]">{Math.round(demandForecast?.prediction ?? demandForecast?.expected_meals ?? 0)} meals</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Model Status:</span>
                    <span className="font-mono font-bold text-amber-700">{demandForecast?.modelStatus || 'EXTERNAL_DATA_MODEL'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 italic pt-1">
                    Source: Kaggle Food Demand Forecasting dataset.
                  </div>
                </div>
              )}
              {monthChartData.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <BarChart data={monthChartData} dataKey="count" nameKey="month" />
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </section>
  );
};

export default Dashboard;
