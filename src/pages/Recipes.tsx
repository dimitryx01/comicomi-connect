
import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import RecipeCard from '@/components/recipe/RecipeCard';
import CreateRecipeForm from '@/components/recipe/CreateRecipeForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipes } from '@/hooks/useRecipes';

const Recipes = () => {
  const { isAuthenticated } = useAuth();
  const { recipes, loading } = useRecipes();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'Todas las Recetas' },
    { id: 'easy', label: 'Fácil' },
    { id: 'quick', label: 'Rápidas (< 30 min)' },
    { id: 'vegetarian', label: 'Vegetarianas' },
    { id: 'popular', label: 'Populares' },
  ];

  const filteredRecipes = recipes.filter(recipe => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'easy') return recipe.difficulty === 'Easy';
    if (selectedFilter === 'quick') return recipe.prep_time + recipe.cook_time < 30;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recetas</h1>
        {isAuthenticated && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Receta
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

      {loading ? (
        <div className="text-center py-8">
          <p>Cargando recetas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              id={recipe.id}
              title={recipe.title}
              author={recipe.author_name}
              image={recipe.image_url}
              prepTime={recipe.prep_time + recipe.cook_time}
              difficulty={recipe.difficulty}
              rating={4.5} // Temporal hasta implementar sistema de ratings
              saves={recipe.saves_count}
            />
          ))}
        </div>
      )}

      {!loading && filteredRecipes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron recetas</p>
        </div>
      )}
    </div>
  );
};

export default Recipes;
