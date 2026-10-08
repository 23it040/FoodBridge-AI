import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import BrandedLoader from '../components/ui/BrandedLoader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <BrandedLoader message="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
