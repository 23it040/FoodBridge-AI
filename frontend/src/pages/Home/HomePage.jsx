import HeroSection from '../../components/home/HeroSection';
import MetricStrip from '../../components/home/MetricStrip';
import HowItWorks from '../../components/home/HowItWorks';
import LiveMapSection from '../../components/home/LiveMapSection';
import SmartMatchingSection from '../../components/home/SmartMatchingSection';
import ImpactSection from '../../components/home/ImpactSection';
import FinalCTA from '../../components/home/FinalCTA';

const HomePage = () => (
  <div className="w-full bg-[#0A1A1A] text-white overflow-x-hidden">
    <HeroSection />
    <MetricStrip />
    <HowItWorks />
    <LiveMapSection />
    <SmartMatchingSection />
    <ImpactSection />
    <FinalCTA />
  </div>
);


export default HomePage;
