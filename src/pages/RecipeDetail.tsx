
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { Loader2, Clock, Users, ChefHat, ArrowLeft, Heart, Bookmark, MessageCircle, Play } from 'lucide-react';
import { LazyImage } from '@/components/ui/LazyImage';
import { useAuth } from '@/contexts/AuthContext';
import { useCheers } from '@/hooks/useCheers';
import { useComments } from '@/hooks/useComments';
import { PostComments } from '@/components/post/PostComments';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  youtube_url: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar_url: string;
  prep_time: number;
  cook_time: number;
  total_time: number;
  servings: number;
  cuisine_type: string;
  difficulty: string;
  ingredients: any[];
  steps: any[];
  allergens: string[];
  tags: string[];
  recipe_interests: string[];
  created_at: string;
  cheers_count: number;
  saves_count: number;
  comments_count: number;
}

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { cheersCount, hasCheered, toggleCheer } = useCheers(id || '', 'recipe');

  const { comments, loading: commentsLoading, addComment, refreshComments } = useComments(id || '', 'recipe');

  useEffect(() => {
    if (!id) {
      setError('ID de receta no válido');
      setLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      try {
        const { data, error } = await supabase.rpc('get_recipe_by_id', {
          recipe_uuid: id
        });

        if (error) {
          console.error('Error fetching recipe:', error);
          setError('Error al cargar la receta');
          return;
        }

        if (!data || data.length === 0) {
          setError('Receta no encontrada');
          return;
        }

        const recipeData = data[0];
        
        // Transform the data to match our Recipe interface
        const transformedRecipe = {
          ...recipeData,
          ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : 
                      typeof recipeData.ingredients === 'string' ? JSON.parse(recipeData.ingredients) : [],
          steps: Array.isArray(recipeData.steps) ? recipeData.steps : 
                 typeof recipeData.steps === 'string' ? JSON.parse(recipeData.steps) : [],
          allergens: Array.isArray(recipeData.allergens) ? recipeData.allergens : [],
          tags: Array.isArray(recipeData.tags) ? recipeData.tags : [],
          recipe_interests: Array.isArray(recipeData.recipe_interests) ? recipeData.recipe_interests : []
        };

        setRecipe(transformedRecipe);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar la receta');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleCommentAdded = async (content: string) => {
    if (!user || !id) return false;
    
    const success = await addComment(content);
    if (success) {
      refreshComments();
    }
    return success;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Receta no disponible</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/recipes')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Recetas
          </Button>
        </div>
      </div>
    );
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Botón para volver */}
      <Button 
        onClick={() => navigate('/recipes')} 
        variant="ghost" 
        size="sm" 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Recetas
      </Button>

      {/* Header de la receta */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-muted-foreground mb-4">{recipe.description}</p>
              
              {/* Información del autor */}
              <UserLink username={recipe.author_username} className="flex items-center space-x-2 mb-4">
                <AvatarWithSignedUrl
                  fileId={recipe.author_avatar_url}
                  fallbackText={recipe.author_name}
                  size="sm"
                />
                <span className="font-medium">{recipe.author_name}</span>
              </UserLink>

              {/* Badges y estadísticas */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{recipe.difficulty}</Badge>
                <Badge variant="outline">{recipe.cuisine_type}</Badge>
                {recipe.youtube_url && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Con Video
                  </Badge>
                )}
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.total_time || (recipe.prep_time + recipe.cook_time)} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} porciones</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCheer}
                className="flex items-center gap-1"
              >
                <Heart className={`h-4 w-4 ${hasCheered ? 'fill-red-500 text-red-500' : ''}`} />
                {cheersCount}
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4" />
                {recipe.comments_count}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Imagen y video */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Imagen */}
        <Card>
          <CardContent className="p-0">
            <LazyImage
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Video si existe */}
        {recipe.youtube_url && (
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(recipe.youtube_url) || ''}
                  title={`Video de ${recipe.title}`}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ingredientes y pasos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredientes */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient: any, index: number) => (
                <li key={index} className="flex justify-between">
                  <span>{ingredient.name}</span>
                  <span className="text-muted-foreground">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pasos */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recipe.steps.map((step: any, index: number) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {step.step || index + 1}
                  </span>
                  <div className="flex-1">
                    <p>{step.description}</p>
                    {step.duration && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {step.duration}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Alérgenos y tags */}
      {(recipe.allergens?.length > 0 || recipe.tags?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recipe.allergens?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Alérgenos:</h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.allergens.map((allergen, index) => (
                    <Badge key={index} variant="destructive">{allergen}</Badge>
                  ))}
                </div>
              </div>
            )}
            {recipe.tags?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comentarios */}
      <Card>
        <CardHeader>
          <CardTitle>Comentarios ({recipe.comments_count})</CardTitle>
        </CardHeader>
        <CardContent>
          <PostComments
            comments={comments}
            currentUser={user}
            commentsLoading={commentsLoading}
            onAddComment={handleCommentAdded}
            onRefreshComments={refreshComments}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeDetail;
