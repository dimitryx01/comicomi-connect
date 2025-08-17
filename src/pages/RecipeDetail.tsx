
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Play, Heart, MessageCircle, ArrowLeft, ChefHat, Timer, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { SaveButton } from '@/components/ui/SaveButton';
import { RecipeOptionsMenu } from '@/components/recipe/RecipeOptionsMenu';
import { RecipeComments } from '@/components/recipe/RecipeComments';
import { EditRecipeDialog } from '@/components/recipe/EditRecipeDialog';
import { AddToShoppingListButton } from '@/components/recipe/AddToShoppingListButton';
import { useRecipeCheers } from '@/hooks/useRecipeCheers';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const { cheersCount, hasCheered, toggleCheer, loading: cheersLoading } = useRecipeCheers(id || '');
  const { toggleSave, isSaved } = useSavedRecipes();

  const fetchRecipe = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase.rpc('get_recipe_by_id', {
        recipe_uuid: id
      });

      if (error) {
        console.error('Error fetching recipe:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la receta",
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Receta no encontrada",
          description: "La receta que buscas no existe o no está disponible",
          variant: "destructive"
        });
        navigate('/recipes');
        return;
      }

      setRecipe(data[0]);
    } catch (error) {
      console.error('Error in fetchRecipe:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la receta",
        variant: "destructive"
      });
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
    // Use setTimeout to prevent auth state conflicts during update
    setTimeout(() => {
      fetchRecipe(); // Refresh the recipe data
    }, 100);
  };

  const handleRecipeDeleted = () => {
    navigate('/recipes');
  };

  const handleSaveClick = async () => {
    if (!id) return;
    setIsSaveLoading(true);
    try {
      await toggleSave(id);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'fácil':
      case 'facil':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medio':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'difícil':
      case 'dificil':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Transform ingredients for AddToShoppingListButton
  const transformedIngredients = recipe?.ingredients ? 
    (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map((ingredient: any) => ({
      name: ingredient.name || ingredient.ingredient || ingredient,
      quantity: ingredient.quantity,
      unit: ingredient.unit
    })) : [];

  // Mostrar botón de guardar si es un usuario autenticado y no es el autor
  const showSaveButton = user && recipe?.author_id && user.id !== recipe.author_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando receta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">Receta no encontrada</p>
            <Button onClick={() => navigate('/recipes')} className="bg-primary hover:bg-primary/90">
              Volver a Recetas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/recipes')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Recetas
            </Button>
            
            <div className="flex items-center gap-2">
              {showSaveButton && (
                <SaveButton
                  isSaved={isSaved(recipe.id)}
                  onToggle={handleSaveClick}
                  loading={isSaveLoading}
                  size="default"
                />
              )}
              <RecipeOptionsMenu 
                recipeId={recipe.id} 
                authorId={recipe.author_id}
                onDelete={handleRecipeDeleted}
                onEdit={handleRecipeEdit}
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative">
          {/* Recipe Image */}
          <div className="h-80 lg:h-96 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ChefHat className="h-24 w-24" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          {/* Recipe Header Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-4xl">
              <div className="flex items-start justify-between mb-4">
                <Badge className={`${getDifficultyColor(recipe.difficulty || '')} text-gray-700 border backdrop-blur-sm`}>
                  {recipe.difficulty}
                </Badge>
                {recipe.youtube_url && (
                  <Badge className="bg-red-600 text-white border-0">
                    <Play className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                {recipe.title}
              </h1>
              
              {recipe.description && (
                <p className="text-xl text-gray-200 max-w-2xl leading-relaxed">
                  {recipe.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-8">
          {/* Author and Stats Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 -mt-12 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Author Info */}
              <div className="flex items-center gap-4">
                <UserLink username={recipe.author_username || ''}>
                  <AvatarWithSignedUrl
                    fileId={recipe.author_avatar_url}
                    fallbackText={recipe.author_name || 'U'}
                    size="lg"
                    className="ring-4 ring-white shadow-lg"
                  />
                </UserLink>
                <div>
                  <UserLink username={recipe.author_username || ''}>
                    <p className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
                      {recipe.author_name || 'Usuario'}
                    </p>
                  </UserLink>
                  <p className="text-sm text-gray-500">
                    Publicado el {new Date(recipe.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={toggleCheer}
                  disabled={cheersLoading}
                  className={`${hasCheered ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100' : 'hover:text-red-500 hover:border-red-200 hover:bg-red-50'} transition-all duration-200 rounded-full px-6`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${hasCheered ? 'fill-current' : ''}`} />
                  {cheersCount} Cheers
                </Button>
                
                <Button variant="outline" className="rounded-full px-6 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {recipe.comments_count} Comentarios
                </Button>
              </div>
            </div>
          </div>

          {/* Recipe Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{recipe.prep_time || 0}</p>
                <p className="text-sm text-blue-700 font-medium">min prep</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-900">{recipe.cook_time || 0}</p>
                <p className="text-sm text-orange-700 font-medium">min cocción</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{recipe.servings || 1}</p>
                <p className="text-sm text-green-700 font-medium">porciones</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <Utensils className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{recipe.cuisine_type || 'N/A'}</p>
                <p className="text-sm text-purple-700 font-medium">cocina</p>
              </CardContent>
            </Card>
          </div>

          {/* Video Section */}
          {recipe.youtube_url && (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-red-600" />
                  Video Tutorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={recipe.youtube_url.replace('watch?v=', 'embed/')}
                    title={recipe.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags, Allergens, and Interests */}
          {((recipe.tags && recipe.tags.length > 0) || (recipe.allergens && recipe.allergens.length > 0) || (recipe.recipe_interests && recipe.recipe_interests.length > 0)) && (
            <Card>
              <CardContent className="p-6 space-y-6">
                {recipe.tags && recipe.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {recipe.allergens && recipe.allergens.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Alérgenos</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.allergens.map((allergen) => (
                        <Badge key={allergen} className="px-3 py-1 bg-red-100 text-red-700 border-red-200 hover:bg-red-200 transition-colors">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recipe.recipe_interests && recipe.recipe_interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Intereses</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.recipe_interests.map((interest) => (
                        <Badge key={interest} className="px-3 py-1 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ingredients and Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Ingredients */}
            <div className="lg:col-span-2">
              <Card className="h-fit sticky top-24">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      Ingredientes
                    </CardTitle>
                    {user && transformedIngredients.length > 0 && (
                      <AddToShoppingListButton
                        recipeId={recipe.id}
                        recipeName={recipe.title}
                        ingredients={transformedIngredients}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {recipe.ingredients && Array.isArray(recipe.ingredients) ? (
                      recipe.ingredients.map((ingredient: any, index: number) => (
                        <li key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="font-medium text-gray-900">{ingredient.name}</span>
                          <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-md">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No hay ingredientes disponibles</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Steps */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Instrucciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ol className="space-y-6">
                    {recipe.steps && Array.isArray(recipe.steps) ? (
                      recipe.steps.map((step: any, index: number) => (
                        <li key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                            {index + 1}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-gray-900 leading-relaxed mb-2">{step.instruction || step.description || step}</p>
                            {step.time && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                Tiempo: {step.time}
                              </div>
                            )}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No hay instrucciones disponibles</li>
                    )}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Comentarios</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipeComments recipeId={recipe.id} />
            </CardContent>
          </Card>
        </div>

        {/* Edit Recipe Dialog */}
        <EditRecipeDialog 
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          recipeId={recipe.id}
          onSuccess={handleRecipeUpdated}
        />
      </div>
    </div>
  );
};

export default RecipeDetail;
