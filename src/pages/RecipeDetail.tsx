
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Play, Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { RecipeOptionsMenu } from '@/components/recipe/RecipeOptionsMenu';
import { RecipeComments } from '@/components/recipe/RecipeComments';
import { EditRecipeDialog } from '@/components/recipe/EditRecipeDialog';
import { useRecipeCheers } from '@/hooks/useRecipeCheers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  youtube_url: string | null;
  author_id: string;
  author_name: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
  prep_time: number | null;
  cook_time: number | null;
  total_time: number | null;
  servings: number | null;
  cuisine_type: string | null;
  difficulty: string | null;
  ingredients: any;
  steps: any;
  allergens: string[] | null;
  tags: string[] | null;
  recipe_interests: string[] | null;
  created_at: string;
  cheers_count: number;
  saves_count: number;
  comments_count: number;
}

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { cheersCount, hasCheered, toggleCheer, loading: cheersLoading } = useRecipeCheers(id || '');

  const fetchRecipe = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase.rpc('get_recipe_by_id', {
        recipe_uuid: id
      });

      if (error) {
        console.error('Error fetching recipe:', error);
        toast.error('Error al cargar la receta');
        return;
      }

      if (!data || data.length === 0) {
        toast.error('Receta no encontrada');
        navigate('/recipes');
        return;
      }

      setRecipe(data[0]);
    } catch (error) {
      console.error('Error in fetchRecipe:', error);
      toast.error('Error al cargar la receta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const handleRecipeEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleRecipeUpdated = () => {
    setIsEditDialogOpen(false);
    fetchRecipe(); // Refresh the recipe data
  };

  const handleRecipeDeleted = () => {
    navigate('/recipes');
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'fácil':
      case 'facil':
        return 'bg-green-100 text-green-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'difícil':
      case 'dificil':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p>Cargando receta...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p>Receta no encontrada</p>
          <Button onClick={() => navigate('/recipes')} className="mt-4">
            Volver a Recetas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/recipes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Recetas
        </Button>
        
        <RecipeOptionsMenu 
          recipeId={recipe.id} 
          authorId={recipe.author_id}
          onDelete={handleRecipeDeleted}
          onEdit={handleRecipeEdit}
        />
      </div>

      {/* Recipe Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-lg text-muted-foreground">{recipe.description}</p>
            )}
          </div>
          <Badge className={getDifficultyColor(recipe.difficulty || '')}>
            {recipe.difficulty}
          </Badge>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3">
          <UserLink username={recipe.author_username || ''}>
            <AvatarWithSignedUrl
              fileId={recipe.author_avatar_url}
              fallbackText={recipe.author_name || 'U'}
              size="md"
            />
          </UserLink>
          <div>
            <UserLink username={recipe.author_username || ''}>
              <p className="font-medium hover:text-primary">
                {recipe.author_name || 'Usuario'}
              </p>
            </UserLink>
            <p className="text-sm text-muted-foreground">
              {new Date(recipe.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Recipe Image and Video */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recipe.image_url && (
          <div className="space-y-4">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-64 lg:h-80 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </div>
        )}

        {recipe.youtube_url && (
          <div className="space-y-4">
            <div className="aspect-video">
              <iframe
                src={recipe.youtube_url.replace('watch?v=', 'embed/')}
                title={recipe.title}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>

      {/* Recipe Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Preparación</span>
              </div>
              <p className="font-semibold">{recipe.prep_time || 0} min</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Cocción</span>
              </div>
              <p className="font-semibold">{recipe.cook_time || 0} min</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Porciones</span>
              </div>
              <p className="font-semibold">{recipe.servings || 1}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <span className="text-sm">Cocina</span>
              </div>
              <p className="font-semibold">{recipe.cuisine_type || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={toggleCheer}
          disabled={cheersLoading}
          className={`${hasCheered ? 'text-red-500 border-red-500' : ''}`}
        >
          <Heart className={`h-4 w-4 mr-2 ${hasCheered ? 'fill-current' : ''}`} />
          {cheersCount} Cheers
        </Button>
        
        <Button variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          {recipe.comments_count} Comentarios
        </Button>
      </div>

      {/* Tags and Allergens */}
      {(recipe.tags && recipe.tags.length > 0) || (recipe.allergens && recipe.allergens.length > 0) && (
        <Card>
          <CardContent className="p-6 space-y-4">
            {recipe.tags && recipe.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {recipe.allergens && recipe.allergens.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Alérgenos</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.allergens.map((allergen) => (
                    <Badge key={allergen} variant="destructive">{allergen}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ingredients and Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients && Array.isArray(recipe.ingredients) ? (
                recipe.ingredients.map((ingredient: any, index: number) => (
                  <li key={index} className="flex justify-between">
                    <span>{ingredient.name}</span>
                    <span className="text-muted-foreground">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </li>
                ))
              ) : (
                <li>No hay ingredientes disponibles</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recipe.steps && Array.isArray(recipe.steps) ? (
                recipe.steps.map((step: any, index: number) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p>{step.description}</p>
                      {step.duration && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Tiempo: {step.duration}
                        </p>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li>No hay instrucciones disponibles</li>
              )}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comentarios</CardTitle>
        </CardHeader>
        <CardContent>
          <RecipeComments recipeId={recipe.id} />
        </CardContent>
      </Card>

      {/* Edit Recipe Dialog */}
      <EditRecipeDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        recipeId={recipe.id}
        onSuccess={handleRecipeUpdated}
      />
    </div>
  );
};

export default RecipeDetail;
