import { NavLink } from 'react-router-dom';
import { FiMenu, FiHeart } from 'react-icons/fi';

const Navbar = ({
  brand = 'FoodBridge AI',
  links = [],
  actions = null,
  onMobileMenuToggle,
  className = ''
}) => (
  <nav className={`bg-white border-b border-[#89D7B7]/40 px-6 py-3.5 shadow-card ${className}`}>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1A312C] transition hover:border-[#428475] hover:text-[#428475]"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        )}
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#428475] text-white shadow-sm">
            <FiHeart className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#1A312C]">
            FoodBridge <span className="text-[#428475]">AI</span>
          </span>
        </NavLink>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors duration-200 ${
                isActive ? 'text-[#428475] border-b-2 border-[#428475] pb-1' : 'text-slate-600 hover:text-[#428475]'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  </nav>
);

export default Navbar;
