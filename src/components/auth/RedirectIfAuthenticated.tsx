
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  console.log('🔄 RedirectIfAuthenticated: === CHECKING REDIRECT STATUS ===');
  console.log('🔄 RedirectIfAuthenticated: Auth loading:', authLoading);
  console.log('🔄 RedirectIfAuthenticated: Profile loading:', profileLoading);
  console.log('🔄 RedirectIfAuthenticated: Is authenticated:', isAuthenticated);
  console.log('🔄 RedirectIfAuthenticated: User ID:', user?.id);
  console.log('🔄 RedirectIfAuthenticated: Profile exists:', !!profile);
  console.log('🔄 RedirectIfAuthenticated: Onboarding completed:', profile?.onboarding_completed);

  // IMPORTANTE: Esperar a que termine de cargar tanto la auth como el perfil
  if (authLoading || (isAuthenticated && profileLoading)) {
    console.log('🔄 RedirectIfAuthenticated: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // SOLO redirigir después de que el perfil haya terminado de cargar
    if (!profile || !profile.onboarding_completed) {
      console.log('🔄 RedirectIfAuthenticated: REDIRECTING TO ONBOARDING');
      return <Navigate to="/onboarding" replace />;
    }
    // Si está autenticado y ha completado onboarding, ir al feed
    console.log('🔄 RedirectIfAuthenticated: REDIRECTING TO FEED');
    return <Navigate to="/feed" replace />;
  }

  console.log('🔄 RedirectIfAuthenticated: Not authenticated, showing children');
  return <>{children}</>;
};
