import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Spinner from './Spinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show spinner while checking auth state
  if (isLoading) {
    return <Spinner size="lg" />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected component
  return children;
};

export default ProtectedRoute;