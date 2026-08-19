import { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/admin.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { FiFileText, FiDownload, FiCalendar, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('monthly');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listReports({ range: activeFilter });
      const raw = res?.data || res || {};
      setReportData(raw);
    } catch (err) {
      console.error('Failed to load admin reports:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load report data');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExportCSV = () => {
    if (!reportData) return toast.error('No report data available to export');

    const csvRows = [];
    csvRows.push(['Metric', 'Value']);
    csvRows.push(['Report Range', activeFilter.toUpperCase()]);
    csvRows.push(['New Users', reportData.newUsers ?? 0]);
    csvRows.push(['Donation Count', reportData.donationCount ?? 0]);
    csvRows.push(['Request Count', reportData.requestCount ?? 0]);
    csvRows.push(['Total Meals Donated', reportData.mealsDonated ?? 0]);
    csvRows.push(['Total Meals Distributed', reportData.mealsDistributed ?? 0]);
    csvRows.push(['Generated At', new Date().toISOString()]);

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `foodbridge_report_${activeFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${activeFilter.toUpperCase()} CSV report from MongoDB!`);
  };

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Impact & Governance Reports"
        subtitle="Generate and export system-wide food waste and redistribution reports from MongoDB"
        actions={
          <Button onClick={loadReport} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card title="Database Report Generator" icon={<FiFileText className="h-5 w-5" />}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={44} />
            <p className="text-xs font-semibold text-slate-500">Generating report from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <div className="flex justify-center text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-800 text-sm">Unable to load report data</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={loadReport} className="mx-auto text-xs px-5 py-2">
              Retry Generating
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF4E1]/40 p-4 rounded-2xl border border-[#89D7B7]">
              <div className="flex flex-wrap gap-2">
                {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setActiveFilter(period)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase transition ${
                      activeFilter === period
                        ? 'bg-[#428475] text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-[#89D7B7]/20'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <Button onClick={handleExportCSV} className="gap-2 text-xs py-2 px-4">
                <FiDownload className="h-4 w-4" />
                <span>Export Real CSV Report</span>
              </Button>
            </div>

            {reportData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Registered Users</span>
                  <div className="text-2xl font-extrabold text-[#1A312C]">{reportData.newUsers ?? 0}</div>
                  <Badge variant="primary">{activeFilter.toUpperCase()}</Badge>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Food Donations Posted</span>
                  <div className="text-2xl font-extrabold text-[#428475]">{reportData.donationCount ?? 0}</div>
                  <Badge variant="success">REDISTRIBUTION</Badge>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Food Requests Submitted</span>
                  <div className="text-2xl font-extrabold text-blue-600">{reportData.requestCount ?? 0}</div>
                  <Badge variant="info">NGO CLAIMS</Badge>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meals Distributed</span>
                  <div className="text-2xl font-extrabold text-emerald-600">{reportData.mealsDistributed ?? 0}</div>
                  <Badge variant="success">IMPACT</Badge>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-semibold text-slate-500">
                No report data available for the selected period.
              </div>
            )}
          </div>
        )}
      </Card>
    </section>
  );
};

export default Reports;
