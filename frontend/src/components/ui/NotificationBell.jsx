import { FiBell } from 'react-icons/fi';

const NotificationBell = ({ unreadCount = 0, onClick, className = '' }) => (
  <button type="button" onClick={onClick} className={`relative inline-flex items-center justify-center rounded-full bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200 ${className}`}>
    <FiBell className="h-5 w-5" />
    {unreadCount > 0 && (
      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[0.65rem] font-semibold text-white">
        {unreadCount}
      </span>
    )}
  </button>
);

export default NotificationBell;
