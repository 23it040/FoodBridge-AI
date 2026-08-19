import { Outlet } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import ErrorBoundary from '../components/error/ErrorBoundary';

const MainLayout = () => (
  <div className="min-h-screen bg-surface text-slate-900">
    <Navigation />
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </main>
    <Footer />
  </div>
);

export default MainLayout;
