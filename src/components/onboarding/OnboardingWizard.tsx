
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProfileStep from './steps/ProfileStep';
import InterestsStep from './steps/InterestsStep';
import PreferencesStep from './steps/PreferencesStep';
import WelcomeStep from './steps/WelcomeStep';

export interface OnboardingData {
  // Profile data
  full_name: string;
  username: string;
  bio: string;
  location: string;
  avatar_url?: string;
  
  // Preferences
  cooking_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  dietary_restrictions: string[];
  favorite_cuisines: string[];
  
  // Interests
  selected_interests: string[];
}

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    cooking_level: 'beginner',
    dietary_restrictions: [],
    favorite_cuisines: [],
    selected_interests: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = [
    { title: 'Bienvenido', component: WelcomeStep },
    { title: 'Tu Perfil', component: ProfileStep },
    { title: 'Tus Intereses', component: InterestsStep },
    { title: 'Preferencias', component: PreferencesStep }
  ];

  const updateData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: onboardingData.full_name,
          username: onboardingData.username,
          bio: onboardingData.bio,
          location: onboardingData.location,
          avatar_url: onboardingData.avatar_url,
          cooking_level: onboardingData.cooking_level,
          dietary_restrictions: onboardingData.dietary_restrictions,
          favorite_cuisines: onboardingData.favorite_cuisines,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Save user interests
      if (onboardingData.selected_interests.length > 0) {
        const interestInserts = onboardingData.selected_interests.map(interestId => ({
          user_id: user.id,
          interest_id: interestId
        }));

        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interestInserts);

        if (interestsError) throw interestsError;
      }

      toast({
        title: "¡Perfil completado!",
        description: "Tu cuenta está lista. ¡Bienvenido a comicomi!"
      });

      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al completar tu perfil. Inténtalo de nuevo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Configurar mi perfil</CardTitle>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} de {steps.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <CurrentStepComponent
            data={onboardingData}
            updateData={updateData}
          />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={completeOnboarding}
                disabled={isLoading}
              >
                {isLoading ? "Completando..." : "Finalizar"}
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Siguiente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
