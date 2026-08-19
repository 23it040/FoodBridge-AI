import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLE_PATHS } from '../constants/roles';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated && user) {
    const destination = ROLE_PATHS[user.role] || '/';
    return <Navigate to={destination} state={{ from: location }} replace />;
  }

  return children;
};

export default PublicRoute;
