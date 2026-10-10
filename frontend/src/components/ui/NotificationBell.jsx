import { FiBell } from 'react-icons/fi';

const NotificationBell = ({ unreadCount = 0, onClick, className = '' }) => (
  <button type="button" onClick={onClick} className={`relative inline-flex items-center justify-center rounded-full bg-white border border-[#E6DED6] p-3 text-[#292B29] transition hover:border-[#BD715C] hover:text-[#BD715C] ${className}`}>
    <FiBell className="h-5 w-5" />
    {unreadCount > 0 && (
      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#BD715C] px-1.5 text-[0.65rem] font-bold text-white shadow-xs">
        {unreadCount}
      </span>
    )}
  </button>
);

export default NotificationBell;
