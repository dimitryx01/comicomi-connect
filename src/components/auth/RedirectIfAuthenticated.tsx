
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  console.log('🚦 RedirectIfAuthenticated Debug:');
  console.log('- Is Authenticated:', isAuthenticated);
  console.log('- User ID:', user?.id);
  console.log('- Auth Loading:', authLoading);
  console.log('- Profile Loading:', profileLoading);
  console.log('- Profile:', profile);
  console.log('- Onboarding Completed:', profile?.onboarding_completed);

  // Mostrar loading mientras se carga la autenticación O mientras se carga el perfil después del login
  if (authLoading || (isAuthenticated && profileLoading)) {
    console.log('⏳ RedirectIfAuthenticated: Still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('✅ RedirectIfAuthenticated: User is authenticated, checking onboarding...');
    
    // Si estamos autenticados pero el perfil aún no se ha cargado, esperar
    if (profileLoading || profile === null) {
      console.log('⏳ RedirectIfAuthenticated: Profile still loading, waiting...');
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    // Si está autenticado pero no ha completado onboarding, ir a onboarding
    if (!profile.onboarding_completed) {
      console.log('➡️ RedirectIfAuthenticated: Redirecting to onboarding');
      return <Navigate to="/onboarding" replace />;
    }
    
    // Si está autenticado y ha completado onboarding, ir al feed
    console.log('➡️ RedirectIfAuthenticated: Redirecting to feed');
    return <Navigate to="/feed" replace />;
  }

  console.log('✅ RedirectIfAuthenticated: User not authenticated, showing auth pages');
  return <>{children}</>;
};
