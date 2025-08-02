
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/config/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProfileStep from './steps/ProfileStep';
import InterestsStep from './steps/InterestsStep';
import PreferencesStep from './steps/PreferencesStep';
import WelcomeStep from './steps/WelcomeStep';

export interface OnboardingData {
  // Profile data - updated with separated fields
  first_name: string;
  last_name: string;
  full_name: string; // keep for backward compatibility
  username: string;
  bio: string;
  city: string;
  country: string;
  location: string; // keep for backward compatibility
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
    first_name: '',
    last_name: '',
    full_name: '',
    username: '',
    bio: '',
    city: '',
    country: '',
    location: '',
    cooking_level: 'beginner',
    dietary_restrictions: [],
    favorite_cuisines: [],
    selected_interests: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    { title: 'Bienvenido', component: WelcomeStep },
    { title: 'Tu Perfil', component: ProfileStep },
    { title: 'Tus Intereses', component: InterestsStep },
    { title: 'Preferencias', component: PreferencesStep }
  ];

  const updateData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => {
      const updated = { ...prev, ...stepData };
      
      // Auto-sync full_name when first_name or last_name changes
      if (stepData.first_name !== undefined || stepData.last_name !== undefined) {
        updated.full_name = `${updated.first_name} ${updated.last_name}`.trim();
      }
      
      // Auto-sync location when city or country changes
      if (stepData.city !== undefined || stepData.country !== undefined) {
        if (updated.city && updated.country) {
          updated.location = `${updated.city}, ${updated.country}`;
        } else if (updated.city) {
          updated.location = updated.city;
        } else if (updated.country) {
          updated.location = updated.country;
        }
      }
      
      return updated;
    });
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
    if (!user) {
      toast({
        title: "Error", 
        description: "No hay usuario autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Completing onboarding for user:', user.id);
      console.log('Onboarding data:', onboardingData);

      // Verificar si el usuario ya existe en la tabla users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      const userPayload = {
        id: user.id,
        email: user.email,
        first_name: onboardingData.first_name,
        last_name: onboardingData.last_name,
        full_name: onboardingData.full_name,
        username: onboardingData.username,
        bio: onboardingData.bio,
        city: onboardingData.city,
        country: onboardingData.country,
        location: onboardingData.location,
        avatar_url: onboardingData.avatar_url,
        cooking_level: onboardingData.cooking_level,
        dietary_restrictions: onboardingData.dietary_restrictions,
        favorite_cuisines: onboardingData.favorite_cuisines,
        onboarding_completed: true
      };

      let userError;
      
      if (existingUser) {
        // Actualizar usuario existente
        console.log('Updating existing user profile');
        const { error } = await supabase
          .from('users')
          .update(userPayload)
          .eq('id', user.id);
        userError = error;
      } else {
        // Crear nuevo usuario
        console.log('Creating new user profile');
        const { error } = await supabase
          .from('users')
          .insert(userPayload);
        userError = error;
      }

      if (userError) throw userError;

      // Guardar intereses del usuario
      if (onboardingData.selected_interests.length > 0) {
        console.log('Saving user interests:', onboardingData.selected_interests);
        
        // Eliminar intereses existentes si los hay
        await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', user.id);

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
        description: `Tu cuenta está lista. ¡Bienvenido a ${APP_CONFIG.name}!`,
        className: "bg-green-50 border-green-200 text-green-800"
      });

      navigate('/feed');
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Profile step - biografía ahora es opcional, ciudad obligatoria
        return onboardingData.first_name.trim() && 
               onboardingData.last_name.trim() && 
               onboardingData.username.trim() &&
               onboardingData.city.trim(); // Ciudad obligatoria
      case 2: // Interests step
        return onboardingData.selected_interests.length > 0;
      case 3: // Preferences step
        return onboardingData.cooking_level;
      default:
        return true;
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Configurar mi perfil</CardTitle>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} de {steps.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        
        <div className="flex-1 overflow-hidden px-6">
          <ScrollArea className="h-full">
            <div className="py-4 pr-4">
              <CurrentStepComponent
                data={onboardingData}
                updateData={updateData}
              />
            </div>
          </ScrollArea>
        </div>
        
        <CardContent className="flex-shrink-0 pt-4">
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
                disabled={isLoading || !isStepValid()}
              >
                {isLoading ? "Completando..." : "Finalizar"}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={!isStepValid()}
              >
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
