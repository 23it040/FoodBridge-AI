const ProfileDropdown = ({ user, items = [], onSignOut, className = '' }) => (
  <div className={`relative inline-block text-left ${className}`}>
    <div className="inline-flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div className="flex flex-col text-left">
        <span className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</span>
        <span className="text-xs text-slate-500">{user?.role || 'Member'}</span>
      </div>
    </div>
    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-3xl border border-slate-200 bg-white shadow-lg">
      <div className="py-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            {item.label}
          </button>
        ))}
        {onSignOut && (
          <button onClick={onSignOut} className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-slate-50">
            Sign out
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ProfileDropdown;
