import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import notificationService from '../../services/notification.service';
import adminService from '../../services/admin.service';
import { normalizePaginationResponse } from '../../utils/normalizeApiResponse';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { FiBell, FiSend, FiCheckCircle, FiTrash2, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showSendForm, setShowSendForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('ALL');
  const [sending, setSending] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.listNotifications({ page: 1, limit: 100 });
      const normalized = normalizePaginationResponse(res, ['notifications', 'items']);
      setNotifications(normalized.items);
    } catch (err) {
      console.error('Failed to load Admin notifications:', err);
      setError(err?.response?.data?.message || err?.message || 'Unable to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      return toast.error('Title and message are required');
    }

    setSending(true);
    try {
      await adminService.createNotification({
        title,
        message,
        recipientType: recipientType === 'ALL' ? 'ALL' : 'USER',
        type: 'SYSTEM_BROADCAST'
      });
      toast.success('Broadcast notification sent successfully!');
      setTitle('');
      setMessage('');
      setShowSendForm(false);
      loadNotifications();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send broadcast notification');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      loadNotifications();
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      toast.success('Notification marked as read');
      loadNotifications();
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const removeNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification deleted');
      loadNotifications();
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <section className="py-6 space-y-6">
      <PageHeader
        title="System Broadcast & Notifications"
        subtitle="Send platform broadcast announcements and manage system notifications"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setShowSendForm((prev) => !prev)} className="gap-2 text-xs">
              <FiSend className="h-4 w-4" />
              <span>{showSendForm ? 'Close Form' : 'Broadcast Message'}</span>
            </Button>
            <Button variant="outline" onClick={handleMarkAllRead} className="text-xs">
              Mark All Read
            </Button>
            <Button onClick={loadNotifications} variant="outline" className="gap-2 text-xs">
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      <Card title="Broadcast & System Logs" icon={<FiBell className="h-5 w-5" />}>
        {showSendForm && (
          <form onSubmit={handleSendBroadcast} className="mb-6 rounded-2xl border border-[#89D7B7] bg-[#FFF4E1]/40 p-5 space-y-4 shadow-sm">
            <h4 className="font-extrabold text-[#1A312C] text-sm flex items-center gap-2">
              <FiSend className="h-4 w-4 text-[#428475]" />
              <span>Send Broadcast Notification</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#1A312C] outline-none transition focus:border-[#428475]"
                  placeholder="e.g. Platform Maintenance Scheduled"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Audience Target
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#1A312C] outline-none"
                >
                  <option value="ALL">All Registered Users</option>
                  <option value="NGO">NGO Partners Only</option>
                  <option value="DONOR">Donors Only</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-[#1A312C] outline-none transition focus:border-[#428475]"
                rows={3}
                placeholder="Write your broadcast message here..."
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={sending} className="px-6 py-2.5 text-xs">
                Send Broadcast
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size={44} />
            <p className="text-xs font-semibold text-slate-500">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="my-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
            <div className="flex justify-center text-red-500">
              <FiAlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="font-extrabold text-red-800 text-sm">Unable to load notifications</h4>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <Button onClick={loadNotifications} className="mx-auto text-xs px-5 py-2">
              Retry Loading
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState title="No Notifications Yet" description="There are no system notifications recorded in MongoDB." />
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
                        {isUnread && <Badge variant="primary">Unread</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">{n.message || n.body}</p>
                      {n.createdAt && <span className="text-[10px] text-slate-400 font-semibold">{new Date(n.createdAt).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isUnread && (
                      <Button size="sm" variant="outline" onClick={() => markRead(n._id || n.id)} className="gap-1.5 text-xs">
                        <FiCheckCircle className="h-3.5 w-3.5" />
                        <span>Mark Read</span>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => removeNotification(n._id || n.id)} className="text-red-600 hover:bg-red-50">
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
