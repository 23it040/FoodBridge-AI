import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import notificationService from '../../services/notification.service';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';

const NotificationsDropdown = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationService.listNotifications({ page: 1, limit: 6 });
      const list = res?.notifications || [];
      setNotifications(list);
      setUnreadCount(res?.unreadCount ?? list.filter((n) => !n.read && !n.isRead).length);
    } catch (err) {
      console.error('Failed to load dropdown notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      await load();
    } catch (err) { console.error(err); }
  };

  const markAll = async () => {
    try {
      await notificationService.markAllAsRead();
      await load();
    } catch (err) { console.error(err); }
  };

  const remove = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      await load();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); load(); }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE5E1] bg-white text-[#102A2A] transition hover:border-[#2F8F72] hover:text-[#2F8F72] shadow-xs"
      >
        <FiBell className="h-5 w-5 text-[#2F8F72]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2F8F72] text-[10px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-84 rounded-[20px] border border-[#DDE5E1] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-[#E8F6F0] rounded-t-[20px]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#102A2A]">Notifications</div>
            <div className="flex items-center gap-3">
              <button onClick={markAll} className="text-xs font-bold text-[#2F8F72] hover:text-[#102A2A]">Mark all</button>
              <Link to="/donor/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-[#687370] hover:text-[#2F8F72]">View all</Link>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
            {loading ? (
              <div className="py-6 text-center"><Spinner size={28} /></div>
            ) : notifications.length === 0 ? (
              <div className="p-4"><EmptyState description="No notifications available." /></div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.read && !n.isRead;
                return (
                  <div key={n._id || n.id} className={`flex items-start justify-between gap-3 rounded-xl p-3 transition-colors ${isUnread ? 'bg-[#E8F6F0]/70 border border-[#79D6B2]/40' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {isUnread && <span className="h-2 w-2 rounded-full bg-[#2F8F72] shrink-0" />}
                        <span className="text-xs font-bold text-[#102A2A]">{n.title || n.message}</span>
                      </div>
                      <p className="text-[11px] font-medium text-[#687370] line-clamp-2">{n.body || n.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {isUnread && (
                        <button onClick={() => markRead(n._id || n.id)} className="text-slate-400 hover:text-[#2F8F72]">
                          <FiCheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => remove(n._id || n.id)} className="text-slate-400 hover:text-red-600">
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2 text-right bg-slate-50/50 rounded-b-[20px]">
            <span className="text-[10px] font-semibold text-[#687370]">Showing {notifications.length} recent notifications</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
