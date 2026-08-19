import { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/admin.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { FiPieChart, FiBarChart2, FiActivity, FiTrendingUp, FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAnalytics();
      const raw = res?.data || res || {};
      setAnalytics(raw);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load analytics data');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Format MongoDB usersByRole aggregation into PieChart array
  const roleBreakdownChartData = Array.isArray(analytics?.usersByRole)
    ? analytics.usersByRole.map((item) => ({
        name: String(item._id || 'user').toUpperCase(),
        value: item.count || 0
      }))
    : [];

  // Format monthlyDonationTrend into BarChart array
  const monthlyTrendChartData = Array.isArray(analytics?.monthlyDonationTrend)
    ? analytics.monthlyDonationTrend.map((item) => ({
        month: item._id || 'Month',
        count: item.donations || item.totalQuantity || 0
      }))
    : [];

  // Format donationsByCategory into PieChart array
  const categoryChartData = Array.isArray(analytics?.donationsByCategory)
    ? analytics.donationsByCategory.map((item) => ({
        name: item._id || 'Uncategorized',
        value: item.count || 0
      }))
    : [];

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Platform Performance & Analytics"
        subtitle="Real-time MongoDB aggregation metrics for platform activity, role distributions, and donation trends"
        actions={
          <Button onClick={loadAnalytics} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size={44} />
          <p className="text-xs font-semibold text-slate-500">Calculating MongoDB analytics...</p>
        </div>
      ) : error ? (
        <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
          <div className="flex justify-center text-red-500">
            <FiAlertTriangle className="h-10 w-10" />
          </div>
          <div>
            <h4 className="font-extrabold text-red-800 text-sm">Unable to load analytics</h4>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={loadAnalytics} className="mx-auto text-xs px-5 py-2">
            Retry Loading
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard
              label="Avg Pickup Response"
              value={analytics?.averagePickupTimeMinutes ? `${Math.round(analytics.averagePickupTimeMinutes)} mins` : 'N/A'}
              change="From NGO claim date"
              icon={<FiActivity className="h-6 w-6" />}
            />
            <StatCard
              label="Avg Completion Time"
              value={analytics?.averageCompletionTimeMinutes ? `${Math.round(analytics.averageCompletionTimeMinutes)} mins` : 'N/A'}
              change="Complete fulfillment cycle"
              icon={<FiCheckCircle className="h-6 w-6" />}
            />
            <StatCard
              label="Total Categories Active"
              value={categoryChartData.length}
              change="Food diversification"
              icon={<FiTrendingUp className="h-6 w-6" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="User Distribution by Role" icon={<FiPieChart className="h-5 w-5" />}>
              <div className="pt-2">
                {roleBreakdownChartData.length > 0 ? (
                  <PieChart data={roleBreakdownChartData} />
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500">No user role data available in database.</div>
                )}
              </div>
            </Card>

            <Card title="Monthly Donation Trends" icon={<FiBarChart2 className="h-5 w-5" />}>
              <div className="pt-2">
                {monthlyTrendChartData.length > 0 ? (
                  <BarChart data={monthlyTrendChartData} dataKey="count" nameKey="month" />
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500">No donation trend data recorded yet.</div>
                )}
              </div>
            </Card>
          </div>

          {categoryChartData.length > 0 && (
            <Card title="Food Donations by Category" icon={<FiPieChart className="h-5 w-5" />}>
              <div className="pt-2">
                <PieChart data={categoryChartData} />
              </div>
            </Card>
          )}
        </>
      )}
    </section>
  );
};

export default Analytics;
