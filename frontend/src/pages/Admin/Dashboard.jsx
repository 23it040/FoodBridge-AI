import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
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
import { FiUsers, FiShield, FiHeart, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const navigate = useNavigate();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, donRes, reqRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.listDonationsAdmin({ limit: 5 }),
        adminService.listRequestsAdmin({ limit: 5 })
      ]);

      const normalizedStats = normalizeObjectResponse(dashRes);
      setStats(normalizedStats);

      const donations = normalizeListResponse(donRes, ['donations', 'items']);
      setRecentDonations(donations);

      const requests = normalizeListResponse(reqRes, ['requests', 'items']);
      setRecentRequests(requests);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load admin control center');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statItems = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <FiUsers className="h-6 w-6" /> },
    { label: 'Registered Donors', value: stats?.totalDonors ?? 0, icon: <FiHeart className="h-6 w-6" /> },
    { label: 'Partner NGOs', value: stats?.totalNgos ?? 0, icon: <FiShield className="h-6 w-6" /> },
    { label: 'Verified NGOs', value: stats?.verifiedNgos ?? 0, icon: <FiCheckCircle className="h-6 w-6" /> },
    { label: 'Pending Verifications', value: stats?.pendingNgoVerifications ?? 0, icon: <FiAlertCircle className="h-6 w-6" /> }
  ];

  const roleBreakdownChartData = [
    { name: 'Donors', value: stats?.totalDonors ?? 0 },
    { name: 'NGOs', value: stats?.totalNgos ?? 0 },
    { name: 'Admins', value: Math.max(0, (stats?.totalUsers ?? 0) - (stats?.totalDonors ?? 0) - (stats?.totalNgos ?? 0)) }
  ].filter((item) => item.value > 0);

  const monthlyDonationsChartData = Array.isArray(stats?.monthlyDonations)
    ? stats.monthlyDonations
    : [
        { month: 'Donated', count: stats?.totalFoodDonations ?? 0 },
        { month: 'Distributed', count: stats?.totalMealsDistributed ?? 0 }
      ];

  return (
    <section className="space-y-6 py-6">
      <PageHeader
        title="Admin Control Center"
        subtitle="Platform metrics, user governance, NGO verifications, and operational analytics"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/ngo-verification')} variant="outline" className="gap-2 text-xs">
              <FiShield className="h-4 w-4" />
              <span>Verify NGOs</span>
            </Button>
            <Button onClick={loadDashboard} variant="outline" className="gap-2 text-xs">
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size={48} />
          <p className="text-xs font-semibold text-slate-500">Loading admin metrics...</p>
        </div>
      ) : error ? (
        <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
          <div className="flex justify-center text-red-500">
            <FiAlertTriangle className="h-10 w-10" />
          </div>
          <div>
            <h4 className="font-extrabold text-red-800 text-sm">Unable to load admin control center</h4>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={loadDashboard} className="mx-auto text-xs px-5 py-2">
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
              description="Platform-wide food listings"
              action={
                <Button size="sm" variant="ghost" onClick={() => navigate('/admin/donations')}>
                  View All
                </Button>
              }
            >
              <DataTable
                columns={[
                  { key: 'foodName', title: 'Food Item', render: (r) => <span className="font-bold text-[#292B29]">{r.foodName || r.name}</span> },
                  { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'AVAILABLE' ? 'success' : 'default'}>{r.status || 'AVAILABLE'}</Badge> }
                ]}
                data={recentDonations}
                showSearch={false}
                emptyMessage="No donations posted."
              />
            </Card>

            <Card
              title="Recent Food Requests"
              description="Platform-wide pickup requests"
              action={
                <Button size="sm" variant="ghost" onClick={() => navigate('/admin/requests')}>
                  View All
                </Button>
              }
            >
              <DataTable
                columns={[
                  { key: 'ngoName', title: 'NGO', render: (r) => <span className="font-bold text-[#292B29]">{r.ngoId?.name || r.ngoName || 'NGO'}</span> },
                  { key: 'status', title: 'Status', render: (r) => <Badge variant={r.status === 'ACCEPTED' ? 'success' : 'warning'}>{r.status || 'PENDING'}</Badge> }
                ]}
                data={recentRequests}
                showSearch={false}
                emptyMessage="No requests submitted."
              />
            </Card>

            <Card title="User & Impact Distribution">
              <div className="space-y-6">
                {roleBreakdownChartData.length > 0 ? (
                  <PieChart data={roleBreakdownChartData} />
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">No user role data.</div>
                )}
                {monthlyDonationsChartData.length > 0 && (
                  <BarChart data={monthlyDonationsChartData} dataKey="count" nameKey="month" />
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </section>
  );
};

export default Dashboard;
