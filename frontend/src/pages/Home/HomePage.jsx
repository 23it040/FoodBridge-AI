import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import NearbyNgosSection from '../../components/home/NearbyNgosSection';
import { FiHeart, FiCpu, FiTrendingUp, FiShield, FiTruck, FiUsers, FiBox } from 'react-icons/fi';

const HomePage = () => (
  <section className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6">
    {/* Hero Section */}
    <div className="relative overflow-hidden rounded-[32px] bg-[#1A312C] p-8 sm:p-12 text-white shadow-elevated border border-[#89D7B7]">
      <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#428475]/30 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-[#89D7B7]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#89D7B7]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#89D7B7] border border-[#89D7B7]/30">
          <FiHeart className="h-4 w-4" />
          <span>AI-Powered Food Redistribution</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Bridge Surplus Food with <span className="text-[#89D7B7]">Communities in Need</span>
        </h1>
        <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed max-w-2xl">
          Connect restaurants, caterers, and individuals with local non-profit NGOs. Our intelligent AI optimizes food matching, predicts spoilage risk, and plans fuel-efficient collection routes.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link to="/auth/register">
            <Button size="lg" variant="secondary" className="px-8 py-3.5 text-base shadow-md">
              Get Started Free
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" variant="outline" className="px-8 py-3.5 text-base bg-transparent text-white border-white hover:bg-white/10">
              Sign In to Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>

    {/* Impact Stats */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Meals Redistributed" value="25,480+" change="+18% this month" icon={<FiBox className="h-6 w-6" />} />
      <StatCard label="Partner NGOs" value="140+" change="Verified non-profits" icon={<FiShield className="h-6 w-6" />} />
      <StatCard label="Food Donors" value="320+" change="Active caterers & cafes" icon={<FiUsers className="h-6 w-6" />} />
      <StatCard label="CO2 Emissions Saved" value="18.4 Tons" change="Environmental impact" icon={<FiTrendingUp className="h-6 w-6" />} />
    </div>

    {/* Live Nearby NGOs Section (OpenStreetMap & Overpass API) */}
    <NearbyNgosSection />

    {/* Core Platform Features */}
    <div className="space-y-6 pt-4">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A312C]">Intelligent Redistribution Platform</h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Engineered with machine learning microservices for real-time food matching and logistics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card title="AI NGO Recommendation" icon={<FiCpu className="h-5 w-5" />}>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Matches surplus food listings with local verified NGOs based on dietary needs, capacity, and proximity.
          </p>
        </Card>

        <Card title="Spoilage Risk Forecasting" icon={<FiTrendingUp className="h-5 w-5" />}>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Evaluates shelf-life and risk scores to prioritize urgent food pickups before degradation.
          </p>
        </Card>

        <Card title="Multi-Stop Route Planner" icon={<FiTruck className="h-5 w-5" />}>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Calculates fuel-efficient pickup routes using interactive Leaflet maps and optimization algorithms.
          </p>
        </Card>
      </div>
    </div>
  </section>
);

export default HomePage;
