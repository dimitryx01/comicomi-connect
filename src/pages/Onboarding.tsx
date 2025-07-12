
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  console.log('🎬 Onboarding Page Debug:');
  console.log('- User:', user?.id);
  console.log('- Auth Loading:', authLoading);
  console.log('- Profile Loading:', profileLoading);
  console.log('- Profile:', profile);
  console.log('- Onboarding Completed:', profile?.onboarding_completed);

  useEffect(() => {
    // Si no estamos cargando y el usuario ha completado el onboarding, redirigir al feed
    if (!authLoading && !profileLoading && profile && profile.onboarding_completed) {
      console.log('✅ Onboarding: User has completed onboarding, redirecting to feed');
      navigate('/feed', { replace: true });
    }
  }, [authLoading, profileLoading, profile, navigate]);

  // Mostrar loading mientras se carga
  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay usuario, algo está mal con la autenticación
  if (!user) {
    console.log('❌ Onboarding: No user found');
    navigate('/login', { replace: true });
    return null;
  }

  // Si el usuario ya completó el onboarding, no mostrar el wizard
  if (profile && profile.onboarding_completed) {
    console.log('✅ Onboarding: User already completed onboarding');
    return null; // El useEffect ya manejará la redirección
  }

  return <OnboardingWizard />;
};

export default Onboarding;
