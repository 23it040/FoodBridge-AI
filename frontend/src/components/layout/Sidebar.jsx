import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiPlusCircle,
  FiPackage,
  FiClipboard,
  FiClock,
  FiSearch,
  FiBell,
  FiUser,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiPieChart,
  FiDatabase,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';

const getDefaultIcon = (item) => {
  if (item.icon) return item.icon;
  const label = (item.label || '').toLowerCase();
  const to = (item.to || '').toLowerCase();

  if (label.includes('dashboard') || to.includes('dashboard')) return <FiGrid className="h-5 w-5" />;
  if (label.includes('donate food') || to.includes('donate')) return <FiPlusCircle className="h-5 w-5" />;
  if (label.includes('my donations') || label.includes('donations') || to.includes('donations')) return <FiPackage className="h-5 w-5" />;
  if (label.includes('nearby') || to.includes('nearby')) return <FiSearch className="h-5 w-5" />;
  if (label.includes('my requests') || label.includes('requests') || to.includes('requests')) return <FiClipboard className="h-5 w-5" />;
  if (label.includes('history') || to.includes('history')) return <FiClock className="h-5 w-5" />;
  if (label.includes('users') || to.includes('users')) return <FiUsers className="h-5 w-5" />;
  if (label.includes('verification') || to.includes('verification')) return <FiCheckSquare className="h-5 w-5" />;
  if (label.includes('reports') || to.includes('reports')) return <FiBarChart2 className="h-5 w-5" />;
  if (label.includes('analytics') || to.includes('analytics')) return <FiPieChart className="h-5 w-5" />;
  if (label.includes('audit') || to.includes('audit')) return <FiDatabase className="h-5 w-5" />;
  if (label.includes('notification') || to.includes('notifications')) return <FiBell className="h-5 w-5" />;
  if (label.includes('profile') || to.includes('profile')) return <FiUser className="h-5 w-5" />;

  return <FiGrid className="h-5 w-5" />;
};

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
      items.map((item) => {
        const icon = getDefaultIcon(item);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
            className={({ isActive }) =>
              `group relative flex items-center ${
                collapsed ? 'justify-center px-2 py-3' : 'gap-3.5 px-3.5 py-3'
              } rounded-2xl text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-[#BD715C]/30 ${
                isActive
                  ? 'bg-[#BD715C] text-white shadow-[0_4px_16px_rgba(189,113,92,0.30)]'
                  : 'bg-transparent text-[#292B29] hover:bg-[#F3DED6] hover:text-[#BD715C] hover:shadow-xs hover:-translate-y-0.5'
              }`
            }
            onClick={onClose}
          >
            <span className="text-lg shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              {icon}
            </span>
            {!collapsed && (
              <span className="truncate transition-opacity duration-200 font-bold">
                {item.label}
              </span>
            )}
            {/* Tooltip in collapsed mode */}
            {collapsed && (
              <div className="absolute left-full ml-3 hidden group-hover:block z-50 whitespace-nowrap rounded-xl bg-[#292B29] border border-[#E6DED6]/20 px-3 py-1.5 text-xs font-bold text-white shadow-xl pointer-events-none">
                {item.label}
              </div>
            )}
          </NavLink>
        );
      }),
    [collapsed, items, onClose]
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[#292B29]/40 backdrop-blur-xs transition-opacity md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden bg-white/95 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none text-[#292B29] border-r border-[#E6DED6] md:border-r-0 px-3 py-6 shadow-xl md:shadow-none transition-all duration-300 md:sticky md:top-[61px] md:h-[calc(100vh-61px)] md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${widthClass} ${className}`}
      >
        {/* LOGO AREA */}
        <div className="mb-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#BD715C] text-white shadow-xs transition-transform hover:scale-105">
              <FiHeart className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <div className="text-base font-extrabold tracking-wide text-[#292B29]">FoodBridge</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#BD715C]">Platform</div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E6DED6] text-[#626760] hover:bg-[#F3DED6] hover:text-[#BD715C] md:hidden"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* NAVIGATION HEADER & TOGGLE ARROW BUTTON */}
        <div className={`mb-4 hidden items-center px-2 md:flex ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#626760]">
              Navigation
            </span>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E6DED6] bg-white/60 text-[#292B29] transition-all duration-200 hover:bg-[#F3DED6] hover:text-[#BD715C] hover:border-[#BD715C]/40 hover:-translate-y-0.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#BD715C]/30"
            >
              {collapsed ? (
                <FiChevronRight className="h-4 w-4 text-[#BD715C]" />
              ) : (
                <FiChevronLeft className="h-4 w-4 text-[#292B29]" />
              )}
            </button>
          )}
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">{content}</div>
      </aside>
    </>
  );
};

export default Sidebar;
