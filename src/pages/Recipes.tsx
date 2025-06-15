
import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import RecipeCard from '@/components/recipe/RecipeCard';
import CreateRecipeForm from '@/components/recipe/CreateRecipeForm';
import { useAuth } from '@/contexts/AuthContext';

const Recipes = () => {
  const { isAuthenticated } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Recipes' },
    { id: 'easy', label: 'Easy' },
    { id: 'quick', label: 'Quick (< 30 min)' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'popular', label: 'Popular' },
  ];

  // Mock recipes data
  const recipes = [
    {
      id: '1',
      title: 'Classic Margherita Pizza',
      author: 'Chef Mario',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      prepTime: 30,
      difficulty: 'Medium',
      rating: 4.8,
      saves: 234
    },
    {
      id: '2',
      title: 'Homemade Pasta Carbonara',
      author: 'Isabella Romano',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d286?w=400',
      prepTime: 20,
      difficulty: 'Easy',
      rating: 4.9,
      saves: 156
    },
    {
      id: '3',
      title: 'Fresh Caprese Salad',
      author: 'Maria Rossi',
      image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400',
      prepTime: 15,
      difficulty: 'Easy',
      rating: 4.7,
      saves: 89
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recipes</h1>
        {isAuthenticated && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <CreateRecipeForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {filters.map((filter) => (
          <Badge
            key={filter.id}
            variant={selectedFilter === filter.id ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedFilter(filter.id)}
          >
            {filter.label}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} {...recipe} />
        ))}
      </div>
    </div>
  );
};

export default Recipes;
