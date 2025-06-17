
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
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

interface EditInterestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentInterests: string[];
}

const iconMap = {
  'ChefHat': ChefHat,
  'Flame': Flame,
  'Apple': Apple,
  'Calendar': Calendar,
  'Heart': Heart
};

const EditInterestsDialog = ({ open, onOpenChange, currentInterests }: EditInterestsDialogProps) => {
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentInterests);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const { updateInterests } = useUserProfile();

  useEffect(() => {
    if (open) {
      fetchInterests();
      setSelectedInterests(currentInterests);
    }
  }, [open, currentInterests]);

  const fetchInterests = async () => {
    try {
      setFetchingData(true);
      console.log('Fetching interests and categories...');

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('interest_categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      const { data: interestsData, error: interestsError } = await supabase
        .from('interests')
        .select('*')
        .order('name');

      if (interestsError) {
        console.error('Error fetching interests:', interestsError);
        return;
      }

      const categoriesWithInterests = (categoriesData || []).map(category => ({
        ...category,
        interests: (interestsData || []).filter(interest => interest.category_id === category.id)
      }));

      console.log('Categories with interests:', categoriesWithInterests);
      setCategories(categoriesWithInterests);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setFetchingData(false);
    }
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await updateInterests(selectedInterests);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedInterests(currentInterests);
    onOpenChange(false);
  };

  if (fetchingData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Intereses Culinarios</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando intereses...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Intereses Culinarios</DialogTitle>
        </DialogHeader>
        
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
                          checked={selectedInterests.includes(interest.id)}
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
          {selectedInterests.length} intereses seleccionados
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInterestsDialog;
