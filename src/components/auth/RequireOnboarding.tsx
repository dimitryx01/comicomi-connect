
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

export const RequireOnboarding = ({ children }: RequireOnboardingProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  // Debug logging
  console.log('🔍 RequireOnboarding Debug:');
  console.log('- User:', user?.id);
  console.log('- Auth Loading:', authLoading);
  console.log('- Profile Loading:', profileLoading);
  console.log('- Profile:', profile);
  console.log('- Onboarding Completed:', profile?.onboarding_completed);

  if (authLoading || profileLoading) {
    console.log('⏳ Still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay perfil o el onboarding no está completo, redirigir al onboarding
  if (!profile || !profile.onboarding_completed) {
    console.log('❌ Redirecting to onboarding:', {
      hasProfile: !!profile,
      onboardingCompleted: profile?.onboarding_completed
    });
    return <Navigate to="/onboarding" replace />;
  }

  console.log('✅ Onboarding completed, showing protected content');
  return <>{children}</>;
};
