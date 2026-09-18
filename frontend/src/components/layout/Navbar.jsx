import { NavLink } from 'react-router-dom';
import { FiMenu, FiHeart } from 'react-icons/fi';

const Navbar = ({
  brand = 'FoodBridge AI',
  links = [],
  actions = null,
  onMobileMenuToggle,
  className = ''
}) => (
  <nav className={`bg-white border-b border-[#DDE5E1] px-6 py-3.5 shadow-sm ${className}`}>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE5E1] bg-white text-[#102A2A] transition hover:border-[#2F8F72] hover:text-[#2F8F72]"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        )}
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2F8F72] text-white shadow-sm">
            <FiHeart className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#102A2A]">
            FoodBridge <span className="text-[#2F8F72]">AI</span>
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
                isActive ? 'text-[#2F8F72] border-b-2 border-[#2F8F72] pb-1' : 'text-[#687370] hover:text-[#2F8F72]'
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
