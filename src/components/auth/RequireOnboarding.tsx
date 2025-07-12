
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

export const RequireOnboarding = ({ children }: RequireOnboardingProps) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  console.log('🛡️ RequireOnboarding: === CHECKING ONBOARDING STATUS ===');
  console.log('🛡️ RequireOnboarding: Auth loading:', authLoading);
  console.log('🛡️ RequireOnboarding: Profile loading:', profileLoading);
  console.log('🛡️ RequireOnboarding: Is authenticated:', isAuthenticated);
  console.log('🛡️ RequireOnboarding: User ID:', user?.id);
  console.log('🛡️ RequireOnboarding: Profile exists:', !!profile);
  console.log('🛡️ RequireOnboarding: Onboarding completed:', profile?.onboarding_completed);

  // IMPORTANTE: Esperar a que termine de cargar tanto la auth como el perfil
  if (authLoading || (isAuthenticated && profileLoading)) {
    console.log('🛡️ RequireOnboarding: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🛡️ RequireOnboarding: NOT AUTHENTICATED - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // SOLO verificar onboarding después de que el perfil haya terminado de cargar
  if (!profile || !profile.onboarding_completed) {
    console.log('🛡️ RequireOnboarding: ONBOARDING NOT COMPLETED - Redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  console.log('🛡️ RequireOnboarding: ONBOARDING COMPLETED - Allowing access');
  return <>{children}</>;
};
