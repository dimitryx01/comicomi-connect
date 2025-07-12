
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('🔒 RequireAuth: === CHECKING AUTH STATUS ===');
  console.log('🔒 RequireAuth: Loading:', loading);
  console.log('🔒 RequireAuth: Is authenticated:', isAuthenticated);
  console.log('🔒 RequireAuth: User ID:', user?.id);
  console.log('🔒 RequireAuth: Current location:', location.pathname);

  if (loading) {
    console.log('🔒 RequireAuth: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 RequireAuth: NOT AUTHENTICATED - Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('🔒 RequireAuth: AUTHENTICATED - Allowing access');
  return <>{children}</>;
};
