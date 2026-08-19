import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { FiChevronLeft, FiX, FiHeart } from 'react-icons/fi';

const Sidebar = ({
  items = [],
  collapsed = false,
  isOpen = false,
  onClose,
  onToggleCollapse,
  className = ''
}) => {
  const widthClass = collapsed ? 'w-20' : 'w-64';

  const content = useMemo(
    () =>
      items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-[#428475] text-white shadow-md'
                : 'text-slate-200 hover:bg-[#89D7B7]/15 hover:text-white'
            }`
          }
          onClick={onClose}
        >
          {item.icon && <span className="text-lg text-[#89D7B7] group-hover:text-white">{item.icon}</span>}
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      )),
    [collapsed, items, onClose]
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[#1A312C]/60 backdrop-blur-xs transition-opacity md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full flex-col overflow-hidden bg-[#1A312C] text-white px-4 py-6 shadow-2xl transition-all duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${widthClass} ${className}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#428475] text-white shadow-sm">
              <FiHeart className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
                <div className="text-base font-extrabold tracking-wide text-white">FoodBridge <span className="text-[#89D7B7]">AI</span></div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#89D7B7]">Eco Redistribution</div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 text-white hover:bg-white/10 md:hidden"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 hidden items-center justify-between px-2 md:flex">
          {!collapsed && <span className="text-[11px] font-bold uppercase tracking-wider text-[#89D7B7]">Navigation</span>}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white transition hover:bg-white/10"
            >
              <FiChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">{content}</div>
      </aside>
    </>
  );
};

export default Sidebar;
