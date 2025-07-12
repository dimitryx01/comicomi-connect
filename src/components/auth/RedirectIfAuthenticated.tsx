
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);

  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Si está autenticado pero no ha completado onboarding, ir a onboarding
    if (!profile || !profile.onboarding_completed) {
      return <Navigate to="/onboarding" replace />;
    }
    // Si está autenticado y ha completado onboarding, ir al feed
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};
