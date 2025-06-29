import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Star, ArrowLeft, Heart, MessageCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { SaveButton } from '@/components/ui/SaveButton';
import { RecipeComments } from '@/components/recipe/RecipeComments';
import { AddToShoppingListButton } from '@/components/recipe/AddToShoppingListButton';
import { useRecipeCheers } from '@/hooks/useRecipeCheers';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const { cheersCount, hasCheered, toggleCheer, loading: cheersLoading } = useRecipeCheers(id || '');
  const { toggleSave, isSaved } = useSavedRecipes();

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_recipe_by_id', { recipe_uuid: id });

      if (error) throw error;

      if (data && data.length > 0) {
        setRecipe(data[0]);
      } else {
        toast({
          title: "Receta no encontrada",
          description: "La receta que buscas no existe o no está disponible",
          variant: "destructive"
        });
        navigate('/recipes');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la receta",
        variant: "destructive"
      });
      navigate('/recipes');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
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

  const handleSaveClick = async () => {
    if (!id) return;
    setIsSaveLoading(true);
    try {
      await toggleSave(id);
    } finally {
      setIsSaveLoading(false);
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl text-center">
        <p>Receta no encontrada</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header con botón de regresar */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold flex-1">{recipe.title}</h1>
        {showSaveButton && (
          <SaveButton
            isSaved={isSaved(recipe.id)}
            onToggle={handleSaveClick}
            loading={isSaveLoading}
            size="default"
          />
        )}
      </div>

      {/* Imagen principal */}
      {recipe.image_url && (
        <div className="relative h-80 rounded-xl overflow-hidden mb-6">
          <img 
            src={recipe.image_url} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{recipe.title}</CardTitle>
                  {recipe.description && (
                    <p className="text-muted-foreground">{recipe.description}</p>
                  )}
                </div>
              </div>
              
              {/* Autor */}
              <div className="flex items-center gap-3 pt-4">
                <UserLink username={recipe.author_username}>
                  <AvatarWithSignedUrl
                    fileId={recipe.author_avatar_url}
                    fallbackText={recipe.author_name}
                    size="md"
                  />
                </UserLink>
                <div>
                  <UserLink username={recipe.author_username}>
                    <p className="font-medium hover:underline">{recipe.author_name}</p>
                  </UserLink>
                  <UserLink username={recipe.author_username}>
                    <p className="text-sm text-muted-foreground hover:underline">
                      @{recipe.author_username}
                    </p>
                  </UserLink>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Ingredientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ingredientes</CardTitle>
                {user && transformedIngredients.length > 0 && (
                  <AddToShoppingListButton
                    recipeId={recipe.id}
                    recipeName={recipe.title}
                    ingredients={transformedIngredients}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recipe.ingredients && Array.isArray(recipe.ingredients) ? (
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      <span>
                        {ingredient.quantity && (
                          <span className="font-medium">{ingredient.quantity} </span>
                        )}
                        {ingredient.unit && (
                          <span className="text-muted-foreground">{ingredient.unit} </span>
                        )}
                        {ingredient.name}
                        {ingredient.notes && (
                          <span className="text-muted-foreground"> - {ingredient.notes}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No hay ingredientes disponibles</p>
              )}
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card>
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
            </CardHeader>
            <CardContent>
              {recipe.steps && Array.isArray(recipe.steps) ? (
                <ol className="space-y-4">
                  {recipe.steps.map((step: any, index: number) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p>{step.instruction || step.description || step}</p>
                        {step.time && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Tiempo: {step.time}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground">No hay instrucciones disponibles</p>
              )}
            </CardContent>
          </Card>

          {/* Video de YouTube si existe */}
          {recipe.youtube_url && (
            <Card>
              <CardHeader>
                <CardTitle>Video de la receta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video">
                  <iframe
                    src={recipe.youtube_url.replace('watch?v=', 'embed/')}
                    title="Video de la receta"
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{recipe.prep_time || 0} min</p>
                  <p className="text-xs text-muted-foreground">Preparación</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <ChefHat className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{recipe.cook_time || 0} min</p>
                  <p className="text-xs text-muted-foreground">Cocción</p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{recipe.servings || 1} personas</p>
                <p className="text-xs text-muted-foreground">Porciones</p>
              </div>

              {recipe.difficulty && (
                <div className="text-center">
                  <Badge className={`${getDifficultyColor(recipe.difficulty)} border font-medium`}>
                    {recipe.difficulty}
                  </Badge>
                </div>
              )}

              {recipe.cuisine_type && (
                <div className="text-center">
                  <Badge variant="outline">{recipe.cuisine_type}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${hasCheered ? 'text-red-500 bg-red-50 hover:bg-red-100' : ''}`}
                  onClick={toggleCheer}
                  disabled={cheersLoading}
                >
                  <Heart className={`h-4 w-4 mr-2 ${hasCheered ? 'fill-current' : ''}`} />
                  {cheersCount} Me gusta
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {recipe.comments_count || 0} Comentarios
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {recipe.saves_count || 0} Guardados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comentarios */}
      {showComments && (
        <div className="mt-8">
          <Separator className="mb-6" />
          <RecipeComments recipeId={recipe.id} />
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
