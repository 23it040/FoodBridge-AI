import { useEffect, useState, useCallback } from 'react';
import adminService from '../../services/admin.service';
import { normalizePaginationResponse } from '../../utils/normalizeApiResponse';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/data/DataTable';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiRefreshCw, FiAlertTriangle, FiShield } from 'react-icons/fi';

const AuditLogs = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.listAuditLogs({ page: 1, limit: 100 });
      const normalized = normalizePaginationResponse(res, ['logs', 'auditLogs', 'items']);
      setLogs(normalized.items);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const columns = [
    {
      key: 'action',
      title: 'Action',
      sortable: true,
      render: (row) => <Badge variant="primary">{row.action || 'ACTION'}</Badge>
    },
    {
      key: 'user',
      title: 'Admin / User',
      render: (row) => {
        const u = row.user || row.adminId;
        if (!u) return <span className="text-xs text-slate-400">System</span>;
        return (
          <div>
            <div className="text-xs font-bold text-[#1A312C]">{u.name || u.email || 'Admin'}</div>
            {u.role && <div className="text-xs text-slate-500">({u.role})</div>}
          </div>
        );
      }
    },
    {
      key: 'entity',
      title: 'Resource Entity',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{row.entity || row.resourceType || '—'}</span>
    },
    {
      key: 'timestamp',
      title: 'Timestamp',
      sortable: true,
      render: (row) => (row.timestamp || row.createdAt ? new Date(row.timestamp || row.createdAt).toLocaleString() : '—')
    },
    {
      key: 'details',
      title: 'Event Details',
      render: (row) => {
        const details = row.details ? JSON.stringify(row.details) : '—';
        return <span className="font-mono text-xs text-slate-600 truncate max-w-xs block">{details}</span>;
      }
    }
  ];

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="System Audit Logs"
        subtitle="Immutable audit trail of administrator actions, governance changes, and security events"
        actions={
          <Button onClick={loadAuditLogs} variant="outline" className="gap-2 text-xs">
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={44} />
            <p className="text-xs font-semibold text-slate-500">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <div className="flex justify-center text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-800 text-sm">Unable to load audit logs</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={loadAuditLogs} className="mx-auto text-xs px-5 py-2">
              Retry Loading
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            rowsPerPage={15}
            searchPlaceholder="Search audit actions, user, entity..."
            emptyMessage="No audit activity yet."
          />
        )}
      </Card>
    </section>
  );
};

export default AuditLogs;
