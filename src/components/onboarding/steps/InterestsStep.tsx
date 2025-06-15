
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingData } from '../OnboardingWizard';
import { ChefHat, Flame, Apple, Calendar, Heart } from 'lucide-react';

interface Interest {
  id: string;
  name: string;
  description?: string;
  category_id: string;
}

interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  interests: Interest[];
}

interface InterestsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const iconMap = {
  'ChefHat': ChefHat,
  'Flame': Flame,
  'Apple': Apple,
  'Calendar': Calendar,
  'Heart': Heart
};

const InterestsStep = ({ data, updateData }: InterestsStepProps) => {
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('interest_categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        setLoading(false);
        return;
      }

      const { data: interestsData, error: interestsError } = await supabase
        .from('interests')
        .select('*')
        .order('name');

      if (interestsError) {
        console.error('Error fetching interests:', interestsError);
        setLoading(false);
        return;
      }

      const categoriesWithInterests = (categoriesData || []).map(category => ({
        ...category,
        interests: (interestsData || []).filter(interest => interest.category_id === category.id)
      }));

      setCategories(categoriesWithInterests);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interestId: string) => {
    const currentInterests = data.selected_interests;
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId];
    
    updateData({ selected_interests: newInterests });
  };

  if (loading) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Cargando intereses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">¿Qué te gusta cocinar?</h2>
        <p className="text-muted-foreground">
          Selecciona tus intereses para personalizar tu experiencia
        </p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon as keyof typeof iconMap] || ChefHat;
          
          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5 text-primary" />
                  <span>{category.name}</span>
                </CardTitle>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {category.interests.map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        checked={data.selected_interests.includes(interest.id)}
                        onCheckedChange={() => toggleInterest(interest.id)}
                      />
                      <label
                        htmlFor={interest.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {interest.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Seleccionaste {data.selected_interests.length} intereses
      </div>
    </div>
  );
};

export default InterestsStep;
