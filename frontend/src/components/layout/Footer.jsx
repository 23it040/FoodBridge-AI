import { Link } from 'react-router-dom';
import { FiBox } from 'react-icons/fi';

const Footer = () => (
  <footer className="border-t border-[#E6DED6] bg-white text-[#292B29] py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
        
        {/* Brand info */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3DED6] border border-[#E6DED6] text-[#BD715C]">
              <FiBox className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#292B29] group-hover:text-[#BD715C] transition-colors">
              Food<span className="text-[#7D9588]">Bridge</span>
            </span>
          </Link>
          <p className="text-xs text-[#626760] leading-relaxed font-normal">
            Food redistribution platform connecting surplus food donors with verified social organizations and community kitchens.
          </p>
        </div>

        {/* Product links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#BD715C] mb-4">Product</h4>
          <ul className="space-y-2.5 text-xs font-medium text-[#626760]">
            <li><Link to="/#live-discovery" className="hover:text-[#BD715C] transition">Discover Food</Link></li>
            <li><Link to="/donor/donate" className="hover:text-[#BD715C] transition">Donate Surplus Food</Link></li>
            <li><Link to="/#live-discovery" className="hover:text-[#BD715C] transition">Verified NGO Network</Link></li>
            <li><Link to="/#how-it-works" className="hover:text-[#BD715C] transition">How It Works</Link></li>
          </ul>
        </div>

        {/* Account links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#BD715C] mb-4">Account</h4>
          <ul className="space-y-2.5 text-xs font-medium text-[#626760]">
            <li><Link to="/auth/login" className="hover:text-[#BD715C] transition">Login</Link></li>
            <li><Link to="/auth/register" className="hover:text-[#BD715C] transition">Register as Donor</Link></li>
            <li><Link to="/auth/register" className="hover:text-[#BD715C] transition">Register as NGO Partner</Link></li>
            <li><Link to="/donor/dashboard" className="hover:text-[#BD715C] transition">User Dashboard</Link></li>
          </ul>
        </div>

        {/* Impact & Mission */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#BD715C] mb-4">Mission</h4>
          <p className="text-xs text-[#626760] leading-relaxed mb-4">
            Combating local food insecurity while minimizing waste through technology and verified distribution routes.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E6EEE8] border border-[#E6DED6] px-3.5 py-1 text-[11px] font-semibold text-[#7D9588]">
            <span>Zero Food Waste Initiative</span>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-[#E6DED6] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#626760] gap-3">
        <p>© {new Date().getFullYear()} FoodBridge Platform. All rights reserved.</p>
        <p>Connecting surplus food generators with verified community partners.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
