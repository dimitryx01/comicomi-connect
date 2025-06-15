
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Heart, Users } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const WelcomeStep = ({ data, updateData }: WelcomeStepProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <ChefHat className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">¡Bienvenido a comicomi!</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Vamos a configurar tu perfil para personalizar tu experiencia culinaria
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <CardContent className="text-center space-y-2 p-0">
            <Users className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium">Conecta</h3>
            <p className="text-sm text-muted-foreground">
              Con otros amantes de la cocina
            </p>
          </CardContent>
        </Card>
        
        <Card className="p-4">
          <CardContent className="text-center space-y-2 p-0">
            <ChefHat className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium">Descubre</h3>
            <p className="text-sm text-muted-foreground">
              Recetas adaptadas a tus gustos
            </p>
          </CardContent>
        </Card>
        
        <Card className="p-4">
          <CardContent className="text-center space-y-2 p-0">
            <Heart className="w-8 h-8 text-primary mx-auto" />
            <h3 className="font-medium">Comparte</h3>
            <p className="text-sm text-muted-foreground">
              Tus creaciones culinarias
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeStep;
