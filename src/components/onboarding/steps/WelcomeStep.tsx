
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Heart, Users } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';
import { APP_CONFIG } from '@/config/app';

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const WelcomeStep = ({ data, updateData }: WelcomeStepProps) => {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <ChefHat className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">¡Bienvenido a {APP_CONFIG.name}!</h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
          Vamos a configurar tu perfil para personalizar tu experiencia culinaria
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">¿Qué puedes hacer en {APP_CONFIG.name}?</h3>
        
        <div className="grid gap-3 max-w-sm mx-auto">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-sm">Conectar</h4>
              <p className="text-xs text-muted-foreground">Con otros amantes de la cocina</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-sm">Descubrir</h4>
              <p className="text-xs text-muted-foreground">Recetas adaptadas a tus gustos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-sm">Compartir</h4>
              <p className="text-xs text-muted-foreground">Tus creaciones culinarias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
