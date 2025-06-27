
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import RecipeCard from '@/components/recipe/RecipeCard';
import RecipeFilters, { RecipeFilters as IRecipeFilters } from '@/components/recipe/RecipeFilters';
import EnhancedCreateRecipeForm from '@/components/recipe/EnhancedCreateRecipeForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipesEnhanced } from '@/hooks/useRecipesEnhanced';

const Recipes = () => {
  const { isAuthenticated } = useAuth();
  const { recipes, loading, applyFilters, refreshRecipes } = useRecipesEnhanced();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleFiltersChange = (filters: IRecipeFilters) => {
    applyFilters(filters);
  };

  const handleRecipeCreated = () => {
    setIsCreateDialogOpen(false);
    refreshRecipes();
  };

  console.log('📄 Recipes page render:', {
    recipesCount: recipes.length,
    loading,
    sampleRecipe: recipes[0] ? {
      id: recipes[0].id,
      title: recipes[0].title,
      author_name: recipes[0].author_name,
      author_username: recipes[0].author_username,
      author_avatar_url: recipes[0].author_avatar_url
    } : null
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
              <EnhancedCreateRecipeForm onSuccess={handleRecipeCreated} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <RecipeFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Lista de recetas */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-8">
              <p>Cargando recetas...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-muted-foreground">
                  {recipes.length} receta{recipes.length !== 1 ? 's' : ''} encontrada{recipes.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      id={recipe.id}
                      title={recipe.title}
                      author={recipe.author_name || 'Usuario'}
                      authorUsername={recipe.author_username || ''}
                      authorAvatar={recipe.author_avatar_url}
                      image={recipe.image_url || '/placeholder.svg'}
                      prepTime={recipe.total_time || (recipe.prep_time || 0) + (recipe.cook_time || 0)}
                      difficulty={recipe.difficulty || 'Medio'}
                      rating={0} // Por ahora sin sistema de ratings
                      saves={recipe.saves_count || 0}
                      cheersCount={recipe.cheers_count || 0}
                      hasVideo={!!recipe.youtube_url}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron recetas que coincidan con los filtros</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
