import { useEffect, useState, useCallback } from 'react';
import notificationService from '../../services/notification.service';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiBell, FiCheckCircle, FiTrash2 } from 'react-icons/fi';

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.listNotifications({ page: 1, limit: 50 });
      setNotifications(res?.notifications || []);
    } catch (err) {
      console.error('Failed to load donor notifications:', err);
      setError(err?.response?.data?.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      load();
    } catch (err) {
      console.error(err);
    }
  }, [load]);

  const remove = useCallback(async (id) => {
    try {
      await notificationService.deleteNotification(id);
      load();
    } catch (err) {
      console.error(err);
    }
  }, [load]);

  if (error && !loading) return (
    <section className="py-6 space-y-6">
      <PageHeader title="Notifications Center" subtitle="Stay updated with food requests and delivery alerts" />
      <Card>
        <EmptyState description={error} action={<Button onClick={load}>Retry</Button>} />
      </Card>
    </section>
  );

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="Notifications Center"
        subtitle="Real-time updates regarding your food donations, claims, and status changes"
      />
      <Card title="Activity Feed" icon={<FiBell className="h-5 w-5" />}>
        {loading ? (
          <div className="py-12 text-center"><Spinner size={44} /></div>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <EmptyState title="No Notifications" description="You're all caught up! New food requests, donation updates, and important alerts will appear here." />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const isUnread = !n.read && !n.isRead;
              return (
                <div
                  key={n._id || n.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-4 transition-all ${
                    isUnread ? 'bg-[#FFF4E1]/50 border border-[#89D7B7] shadow-xs' : 'bg-white border border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isUnread ? 'bg-[#428475] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <FiBell className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-[#1A312C] text-sm">{n.title || n.message}</h4>
                        {isUnread && <Badge variant="primary">New</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">{n.message || n.body}</p>
                      <span className="mt-1 block text-[10px] font-semibold text-slate-400">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isUnread && (
                      <Button size="sm" variant="outline" onClick={() => markRead(n._id || n.id)} className="gap-1.5 text-xs">
                        <FiCheckCircle className="h-3.5 w-3.5" />
                        <span>Mark Read</span>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove(n._id || n.id)} className="text-red-600 hover:bg-red-50">
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
};

export default NotificationsPage;
