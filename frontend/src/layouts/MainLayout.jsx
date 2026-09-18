import { Outlet } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import ErrorBoundary from '../components/error/ErrorBoundary';

const MainLayout = () => (
  <div className="min-h-screen bg-[#0A1A1A] text-white flex flex-col justify-between overflow-x-hidden">
    <Navigation />
    <main className="w-full flex-grow">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </main>
    <Footer />
  </div>
);

export default MainLayout;

