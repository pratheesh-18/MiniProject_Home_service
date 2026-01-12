import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'provider' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user } = useAppStore();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to home if role doesn't match
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

