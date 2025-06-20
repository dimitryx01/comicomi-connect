import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LazyPostCard } from '@/components/post/LazyPostCard';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import { PostSkeleton } from '@/components/post/PostSkeleton';
import CreatePostForm from '@/components/post/CreatePostForm';
import { usePosts } from '@/hooks/usePosts';
import { useSharedPostsQuery } from '@/hooks/useSharedPostsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';

type FeedItem = (Post & { type: 'post' }) | (SharedPost & { type: 'shared' });

const Feed = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Obtener posts normales y compartidos por separado
  const { 
    posts, 
    loading: postsLoading, 
    hasMore: hasMorePosts, 
    totalCount: totalPosts, 
    loadMorePosts,
    refreshPosts
  } = usePosts();

  const {
    sharedPosts,
    loading: sharedPostsLoading,
    hasMore: hasMoreSharedPosts,
    loadMore: loadMoreSharedPosts,
    refetch: refreshSharedPosts
  } = useSharedPostsQuery();

  console.log('📱 Feed: Estado de datos:', {
    isAuthenticated,
    authLoading,
    postsCount: posts.length,
    sharedPostsCount: sharedPosts.length,
    postsLoading,
    sharedPostsLoading
  });

  // Combinar y ordenar posts normales y compartidos por fecha
  const combinedFeedItems: FeedItem[] = [
    ...posts.map(post => ({ ...post, type: 'post' as const })),
    ...sharedPosts.map(sharedPost => ({ ...sharedPost, type: 'shared' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const isLoading = postsLoading || sharedPostsLoading;
  const hasMore = hasMorePosts || hasMoreSharedPosts;

  const handleLoadMore = async () => {
    console.log('📄 Feed: Solicitando cargar más contenido');
    // Cargar más de ambos tipos si hay contenido disponible
    const promises = [];
    if (hasMorePosts) promises.push(loadMorePosts());
    if (hasMoreSharedPosts) promises.push(loadMoreSharedPosts());
    
    await Promise.all(promises);
  };

  const handleCreatePostSuccess = () => {
    console.log('✅ Feed: Post creado exitosamente, cerrando diálogo y refrescando...');
    setIsCreateDialogOpen(false);
    // Refrescar ambos tipos de contenido
    refreshPosts();
    refreshSharedPosts();
  };

  // No renderizar el diálogo hasta que la autenticación esté cargada
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Debes iniciar sesión para ver el feed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Trending Topics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Nearby Restaurants
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Recipe Ideas
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed - Center column */}
        <div className="lg:col-span-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Your Feed</h1>
                {combinedFeedItems.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Mostrando {combinedFeedItems.length} publicaciones ({posts.length} posts, {sharedPosts.length} compartidas)
                  </p>
                )}
              </div>
              
              {/* Diálogo de creación con correcciones de accesibilidad */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="text-xs sm:text-sm"
                    disabled={!isAuthenticated}
                    aria-label="Crear nuevo post"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Create Post</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="w-[95vw] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                  aria-describedby="create-post-description"
                >
                  <DialogHeader>
                    <DialogTitle>Crear nuevo post</DialogTitle>
                  </DialogHeader>
                  <div id="create-post-description" className="sr-only">
                    Formulario para crear un nuevo post con contenido, imágenes y ubicación
                  </div>
                  <CreatePostForm onSuccess={handleCreatePostSuccess} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Renderizar contenido mixto */}
              {combinedFeedItems.map((item) => {
                if (item.type === 'post') {
                  console.log('🔄 Feed: Renderizando post normal:', {
                    postId: item.id,
                    authorName: item.author_name,
                    hasMedia: !!(item.media_urls?.images?.length || item.media_urls?.videos?.length)
                  });

                  return (
                    <LazyPostCard 
                      key={`post-${item.id}`}
                      id={item.id}
                      user={{
                        id: item.author_id,
                        name: item.author_name,
                        username: item.author_username,
                        avatar: item.author_avatar
                      }}
                      content={item.content}
                      imageUrl={item.media_urls?.images?.[0]}
                      videoUrl={item.media_urls?.videos?.[0]}
                      mediaUrls={item.media_urls}
                      likes={item.cheers_count}
                      comments={item.comments_count}
                      createdAt={item.created_at}
                      restaurant={item.restaurant_name ? {
                        id: item.restaurant_id || '',
                        name: item.restaurant_name
                      } : undefined}
                    />
                  );
                } else if (item.type === 'shared') {
                  console.log('🔄 Feed: Renderizando publicación compartida:', {
                    sharedId: item.id,
                    sharedType: item.shared_type,
                    sharerName: item.sharer.full_name
                  });

                  return (
                    <SharedPostCard 
                      key={`shared-${item.id}`}
                      sharedPost={item}
                    />
                  );
                }
                return null;
              })}

              {/* Loading skeletons for initial load */}
              {isLoading && combinedFeedItems.length === 0 && (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <PostSkeleton key={`skeleton-${index}`} />
                  ))}
                </>
              )}

              {/* Load More Button */}
              {hasMore && combinedFeedItems.length > 0 && (
                <div className="flex justify-center py-6">
                  <Button 
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cargando contenido...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Cargar más contenido
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* No more content message */}
              {!hasMore && combinedFeedItems.length > 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    ¡Has visto todo el contenido disponible! 🎉
                  </p>
                </div>
              )}

              {/* Empty state */}
              {combinedFeedItems.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay contenido disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Suggestions</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New Restaurant</p>
                    <p className="text-xs text-muted-foreground">Near you</p>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Food Blogger</p>
                    <p className="text-xs text-muted-foreground">@foodie123</p>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Trending</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">#FoodTrends</p>
                  <p className="text-xs text-muted-foreground">2.1K posts</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">#LocalEats</p>
                  <p className="text-xs text-muted-foreground">1.8K posts</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">#RecipeShare</p>
                  <p className="text-xs text-muted-foreground">956 posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
