
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, X } from 'lucide-react';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSharedPostInteractions } from '@/hooks/useSharedPostInteractions';
import { useSharedPostComments } from '@/hooks/useSharedPostComments';
import { SharedPostComments } from '@/components/post/SharedPostComments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SharedPost } from '@/types/sharedPost';

const SharedPostDetail = () => {
  const { sharedPostId } = useParams<{ sharedPostId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [sharedPost, setSharedPost] = useState<SharedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { 
    cheersCount, 
    hasCheered, 
    commentsCount, 
    loading: interactionsLoading, 
    toggleCheer, 
    addComment 
  } = useSharedPostInteractions(sharedPostId || '');

  const { 
    comments, 
    loading: commentsLoading, 
    refreshComments 
  } = useSharedPostComments(sharedPostId || '');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!sharedPostId) {
      navigate('/feed');
      return;
    }
    fetchSharedPost();
  }, [sharedPostId]);

  const fetchSharedPost = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_posts')
        .select(`
          id,
          sharer_id,
          shared_type,
          shared_post_id,
          shared_recipe_id,
          shared_restaurant_id,
          comment,
          created_at,
          updated_at,
          users!shared_posts_sharer_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('id', sharedPostId)
        .single();

      if (error) throw error;

      if (data) {
        // Fetch original content based on shared type
        let originalContent = null;

        if (data.shared_type === 'post' && data.shared_post_id) {
          const { data: postData } = await supabase
            .from('posts')
            .select(`
              id,
              content,
              media_urls,
              location,
              created_at,
              users!posts_author_id_fkey (
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .eq('id', data.shared_post_id)
            .eq('is_public', true)
            .single();

          if (postData) {
            originalContent = {
              id: postData.id,
              content: postData.content,
              media_urls: postData.media_urls,
              location: postData.location,
              created_at: postData.created_at,
              author: {
                id: postData.users?.id,
                full_name: postData.users?.full_name,
                username: postData.users?.username,
                avatar_url: postData.users?.avatar_url
              }
            };
          }
        } else if (data.shared_type === 'recipe' && data.shared_recipe_id) {
          const { data: recipeData } = await supabase
            .from('recipes')
            .select(`
              id,
              title,
              description,
              image_url,
              created_at,
              users!recipes_author_id_fkey (
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .eq('id', data.shared_recipe_id)
            .eq('is_public', true)
            .single();

          if (recipeData) {
            originalContent = {
              id: recipeData.id,
              title: recipeData.title,
              description: recipeData.description,
              image_url: recipeData.image_url,
              created_at: recipeData.created_at,
              author: {
                id: recipeData.users?.id,
                full_name: recipeData.users?.full_name,
                username: recipeData.users?.username,
                avatar_url: recipeData.users?.avatar_url
              }
            };
          }
        } else if (data.shared_type === 'restaurant' && data.shared_restaurant_id) {
          const { data: restaurantData } = await supabase
            .from('restaurants')
            .select(`
              id,
              name,
              description,
              cover_image_url,
              location,
              cuisine_type,
              created_at
            `)
            .eq('id', data.shared_restaurant_id)
            .single();

          if (restaurantData) {
            originalContent = {
              id: restaurantData.id,
              name: restaurantData.name,
              description: restaurantData.description,
              cover_image_url: restaurantData.cover_image_url,
              location: restaurantData.location,
              cuisine_type: restaurantData.cuisine_type,
              created_at: restaurantData.created_at
            };
          }
        }

        const sharedPostData: SharedPost = {
          id: data.id,
          sharer_id: data.sharer_id,
          shared_type: data.shared_type as 'post' | 'recipe' | 'restaurant',
          shared_post_id: data.shared_post_id,
          shared_recipe_id: data.shared_recipe_id,
          shared_restaurant_id: data.shared_restaurant_id,
          comment: data.comment,
          created_at: data.created_at,
          updated_at: data.updated_at,
          sharer: {
            id: data.users?.id || '',
            full_name: data.users?.full_name || 'Usuario',
            username: data.users?.username || 'usuario',
            avatar_url: data.users?.avatar_url || ''
          },
          original_content: originalContent,
          cheers_count: cheersCount,
          comments_count: commentsCount,
          has_cheered: hasCheered
        };

        setSharedPost(sharedPostData);
      }
    } catch (error) {
      console.error('Error fetching shared post:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la publicación compartida",
        variant: "destructive"
      });
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePostDeleted = () => {
    toast({
      title: "Publicación eliminada",
      description: "La publicación compartida ha sido eliminada exitosamente"
    });
    navigate('/feed');
  };

  const handlePostUpdated = () => {
    fetchSharedPost();
  };

  const handleAddComment = async (content: string) => {
    const success = await addComment(content);
    if (success) {
      refreshComments();
    }
    return success;
  };

  const currentUser = user ? {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'usuario',
    avatar: user.user_metadata?.avatar_url
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sharedPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Publicación no encontrada</h2>
          <Button onClick={handleBack}>Volver</Button>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Publicación Compartida</h1>
        </div>

        {/* Mobile Content */}
        <div className="pb-6 px-4">
          <SharedPostCard
            sharedPost={sharedPost}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
          />
          
          {/* Full Comments Section */}
          <Card className="mt-4">
            <SharedPostComments
              comments={comments}
              currentUser={currentUser}
              commentsLoading={commentsLoading}
              onAddComment={handleAddComment}
              onRefreshComments={refreshComments}
            />
          </Card>
        </div>
      </div>
    );
  }

  // Desktop Layout - Modal Style
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative bg-background rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Desktop Content */}
        <div className="h-full max-h-[90vh] overflow-y-auto p-6">
          <SharedPostCard
            sharedPost={sharedPost}
            onPostDeleted={handlePostDeleted}
            onPostUpdated={handlePostUpdated}
          />
          
          {/* Full Comments Section */}
          <Card className="mt-6">
            <SharedPostComments
              comments={comments}
              currentUser={currentUser}
              commentsLoading={commentsLoading}
              onAddComment={handleAddComment}
              onRefreshComments={refreshComments}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SharedPostDetail;
