import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/api';

export const SessionGuard = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Loading session...</p>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
};

export const RoleGuard = ({ allowedRole }: { allowedRole: UserRole }) => {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRole)) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
};
