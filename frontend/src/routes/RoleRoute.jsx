import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLE_PATHS } from '../constants/roles';
import BrandedLoader from '../components/ui/BrandedLoader';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <BrandedLoader message="Checking permissions..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = (user.role || '').toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  if (!normalizedAllowed.includes(userRole)) {
    const fallbackPath = ROLE_PATHS[userRole] || ROLE_PATHS[user.role] || '/';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleRoute;
