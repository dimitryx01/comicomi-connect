
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { ProfileDebug } from '@/components/debug/ProfileDebug';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

const Onboarding = () => {
  const [showDebug, setShowDebug] = useState(true); // Mostrar por defecto para depuración
  const { user } = useAuth();
  const { profile } = useUserProfile();
  
  useEffect(() => {
    console.log('📋 Onboarding Page: === ONBOARDING PAGE MOUNTED ===');
    console.log('📋 Onboarding Page: User:', user?.id);
    console.log('📋 Onboarding Page: Profile:', profile);
    console.log('📋 Onboarding Page: Onboarding completed:', profile?.onboarding_completed);
  }, [user, profile]);
  
  return (
    <div>
      <OnboardingWizard />
      
      {/* Botón para mostrar/ocultar el depurador */}
      <div className="fixed bottom-4 right-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? 'Ocultar depurador' : 'Mostrar depurador'}
        </Button>
      </div>
      
      {/* Depurador de perfil */}
      {showDebug && (
        <div className="fixed bottom-16 right-4 w-96 max-w-[90vw] z-50">
          <ProfileDebug />
        </div>
      )}
    </div>
  );
};

export default Onboarding;
