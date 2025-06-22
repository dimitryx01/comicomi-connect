
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { RefreshCw, PenTool, TrendingUp, Users, Calendar } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { useSharedPostsQuery } from '@/hooks/useSharedPostsQuery';
import { useToast } from '@/hooks/use-toast';
import CreatePostForm from '@/components/post/CreatePostForm';
import PostCard from '@/components/post/PostCard';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import { PostSkeleton } from '@/components/post/PostSkeleton';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';

interface CombinedFeedItem {
  type: 'post' | 'shared_post';
  data: Post | SharedPost;
  created_at: string;
  id: string;
}

const Feed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [combinedFeed, setCombinedFeed] = useState<CombinedFeedItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    posts, 
    loading: postsLoading, 
    hasMore: hasMorePosts,
    loadMorePosts,
    refreshPosts,
    isFetchingNextPage: isFetchingMorePosts
  } = usePosts();
  
  const { 
    sharedPosts, 
    loading: sharedPostsLoading, 
    refetch: refetchSharedPosts 
  } = useSharedPostsQuery();

  const loading = postsLoading || sharedPostsLoading;

  useEffect(() => {
    const combineFeedData = () => {
      console.log('🔄 Feed: Combining feed data...');
      const combined: CombinedFeedItem[] = [];

      // Add regular posts
      if (posts && Array.isArray(posts)) {
        posts.forEach(post => {
          combined.push({
            type: 'post',
            data: post,
            created_at: post.created_at,
            id: `post-${post.id}`
          });
        });
      }

      // Add shared posts
      if (sharedPosts && Array.isArray(sharedPosts)) {
        sharedPosts.forEach(sharedPost => {
          combined.push({
            type: 'shared_post',
            data: sharedPost,
            created_at: sharedPost.created_at,
            id: `shared-${sharedPost.id}`
          });
        });
      }

      // Sort by creation date (newest first)
      combined.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      console.log('✅ Feed: Combined feed created with', combined.length, 'items');
      setCombinedFeed(combined);
    };

    combineFeedData();
  }, [posts, sharedPosts]);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 Feed: Manual refresh requested...');
    try {
      await Promise.all([
        refreshPosts(),
        refetchSharedPosts()
      ]);
      toast({
        title: "Feed actualizado",
        description: "Se ha refrescado el contenido del feed",
      });
    } catch (error) {
      console.error('❌ Feed: Error refreshing:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el feed",
        variant: "destructive"
      });
    }
  }, [refreshPosts, refetchSharedPosts, toast]);

  const handlePostCreated = useCallback(() => {
    console.log('📝 Feed: Post created, closing dialog and refreshing...');
    setShowCreatePost(false);
    handleRefresh();
    toast({
      title: "¡Éxito!",
      description: "Post creado correctamente"
    });
  }, [handleRefresh, toast]);

  const handleLoadMore = useCallback(() => {
    if (hasMorePosts && !isFetchingMorePosts) {
      console.log('📄 Feed: Loading more posts...');
      loadMorePosts();
    }
  }, [hasMorePosts, isFetchingMorePosts, loadMorePosts]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-medium mb-2">Acceso requerido</h2>
        <p className="text-muted-foreground text-center">
          Necesitas iniciar sesión para ver el feed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Feed Principal - Expandido */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header con botón crear post */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tu Feed</h1>
          <div className="flex gap-3">
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <PenTool className="h-4 w-4 mr-2" />
                  Crear Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <CreatePostForm onSuccess={handlePostCreated} />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="default"
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {loading && combinedFeed.length === 0 ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))
          ) : combinedFeed.length === 0 ? (
            // Empty state
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <h3 className="text-lg font-medium mb-2">No hay publicaciones aún</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Sé el primero en compartir algo increíble con la comunidad
                </p>
                <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                  <DialogTrigger asChild>
                    <Button>
                      <PenTool className="h-4 w-4 mr-2" />
                      Crear tu primera publicación
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CreatePostForm onSuccess={handlePostCreated} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            // Feed items
            <>
              {combinedFeed.map((item) => (
                <div key={item.id}>
                  {item.type === 'post' ? (
                    <PostCard 
                      id={(item.data as Post).id}
                      user={{
                        id: (item.data as Post).author?.id || '',
                        name: (item.data as Post).author?.full_name || 'Usuario',
                        username: (item.data as Post).author?.username || 'usuario',
                        avatar: (item.data as Post).author?.avatar_url
                      }}
                      content={(item.data as Post).content}
                      mediaUrls={(item.data as Post).media_urls}
                      createdAt={(item.data as Post).created_at}
                      location={(item.data as Post).location}
                      restaurant={(item.data as Post).restaurant}
                      is_shared={(item.data as Post).is_shared}
                      shared_data={(item.data as Post).shared_data}
                    />
                  ) : (
                    <SharedPostCard sharedPost={item.data as SharedPost} />
                  )}
                </div>
              ))}
              
              {/* Load more button */}
              {hasMorePosts && (
                <div className="flex justify-center pt-6">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore}
                    disabled={isFetchingMorePosts}
                    className="rounded-full"
                  >
                    {isFetchingMorePosts ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      'Cargar más publicaciones'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sidebar Derecha - Expandida */}
      <div className="space-y-6">
        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Tendencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">#PaellaValenciana</p>
              <p className="text-xs text-muted-foreground">125 publicaciones</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">#TapasTime</p>
              <p className="text-xs text-muted-foreground">89 publicaciones</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">#RecetasCaseras</p>
              <p className="text-xs text-muted-foreground">156 publicaciones</p>
            </div>
          </CardContent>
        </Card>

        {/* Sugerencias de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Usuarios sugeridos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div>
                  <p className="text-sm font-medium">Chef María</p>
                  <p className="text-xs text-muted-foreground">@chefmaria</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Seguir</Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div>
                  <p className="text-sm font-medium">Cocina Moderna</p>
                  <p className="text-xs text-muted-foreground">@cocinamoderna</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Seguir</Button>
            </div>
          </CardContent>
        </Card>

        {/* Eventos próximos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Eventos gastronómicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Festival de Tapas Madrid</p>
              <p className="text-xs text-muted-foreground">15-17 Julio</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Mercado de San Miguel</p>
              <p className="text-xs text-muted-foreground">Todos los días</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feed;
