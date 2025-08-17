
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingData } from '../OnboardingWizard';
import { ChefHat, Utensils, Globe } from 'lucide-react';
import { useCuisinesAndUnits } from '@/hooks/useCuisinesAndUnits';

interface PreferencesStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const cookingLevels = [
  { value: 'beginner', label: 'Principiante', description: 'Recién empiezo a cocinar' },
  { value: 'intermediate', label: 'Intermedio', description: 'Cocino regularmente en casa' },
  { value: 'advanced', label: 'Avanzado', description: 'Tengo buena experiencia cocinando' },
  { value: 'expert', label: 'Experto', description: 'Soy muy experimentado o profesional' }
];

const dietaryOptions = [
  'Vegetariano',
  'Vegano',
  'Sin gluten',
  'Sin lactosa',
  'Keto',
  'Paleo',
  'Bajo en sodio',
  'Diabético',
  'Sin frutos secos',
  'Halal',
  'Kosher'
];

const PreferencesStep = ({ data, updateData }: PreferencesStepProps) => {
  const { cuisines, loading } = useCuisinesAndUnits();

  const toggleDietaryRestriction = (restriction: string) => {
    const current = data.dietary_restrictions;
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    updateData({ dietary_restrictions: updated });
  };

  const toggleCuisine = (cuisine: string) => {
    const current = data.favorite_cuisines;
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    updateData({ favorite_cuisines: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Tus preferencias culinarias</h2>
        <p className="text-muted-foreground">
          Esto nos ayudará a recomendarte el contenido perfecto
        </p>
      </div>

      <div className="space-y-6">
        {/* Nivel de cocina */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="w-5 h-5 text-primary" />
              <span>¿Cuál es tu nivel de cocina?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={data.cooking_level}
              onValueChange={(value) => updateData({ cooking_level: value as any })}
            >
              {cookingLevels.map((level) => (
                <div key={level.value} className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value={level.value} id={level.value} />
                  <div className="flex-1">
                    <Label htmlFor={level.value} className="font-medium cursor-pointer">
                      {level.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Restricciones dietéticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-primary" />
              <span>Restricciones dietéticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dietaryOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={data.dietary_restrictions.includes(option)}
                    onCheckedChange={() => toggleDietaryRestriction(option)}
                  />
                  <Label htmlFor={option} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cocinas favoritas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-primary" />
              <span>Cocinas favoritas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Cargando cocinas...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cuisines.map((cuisine) => (
                  <div key={cuisine.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cuisine.slug}
                      checked={data.favorite_cuisines.includes(cuisine.name)}
                      onCheckedChange={() => toggleCuisine(cuisine.name)}
                    />
                    <Label htmlFor={cuisine.slug} className="text-sm cursor-pointer">
                      {cuisine.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreferencesStep;
