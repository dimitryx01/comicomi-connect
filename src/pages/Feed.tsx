
import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LazyPostCard } from '@/components/post/LazyPostCard';
import { PostSkeleton } from '@/components/post/PostSkeleton';
import CreatePostForm from '@/components/post/CreatePostForm';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';

const Feed = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { 
    posts, 
    loading, 
    hasMore, 
    totalCount, 
    postsPerPage,
    loadMorePosts,
    refreshPosts
  } = usePosts();

  console.log('📱 Feed: Estado de autenticación y carga:', {
    isAuthenticated,
    authLoading,
    postsCount: posts.length,
    loading,
    hasMore,
    totalCount
  });

  const handleLoadMore = async () => {
    console.log('📄 Feed: Solicitando cargar más posts');
    await loadMorePosts();
  };

  const handleCreatePostSuccess = () => {
    console.log('✅ Feed: Post creado exitosamente, cerrando diálogo y refrescando...');
    setIsCreateDialogOpen(false);
    // Refrescar el feed después de crear un post
    refreshPosts();
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
                {totalCount > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Mostrando {posts.length} de {totalCount} posts
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
              {posts.map((post) => {
                console.log('🔄 Feed: Renderizando post con lazy loading:', {
                  postId: post.id,
                  authorName: post.author_name,
                  avatarFileId: post.author_avatar,
                  hasAvatar: !!post.author_avatar,
                  hasMedia: !!(post.media_urls?.images?.length || post.media_urls?.videos?.length)
                });

                return (
                  <LazyPostCard 
                    key={post.id} 
                    id={post.id}
                    user={{
                      id: post.author_id,
                      name: post.author_name,
                      username: post.author_username,
                      avatar: post.author_avatar
                    }}
                    content={post.content}
                    imageUrl={post.media_urls?.images?.[0]}
                    videoUrl={post.media_urls?.videos?.[0]}
                    mediaUrls={post.media_urls}
                    likes={post.cheers_count}
                    comments={post.comments_count}
                    createdAt={post.created_at}
                    restaurant={post.restaurant_name ? {
                      id: post.restaurant_id,
                      name: post.restaurant_name
                    } : undefined}
                  />
                );
              })}

              {/* Loading skeletons for initial load */}
              {loading && posts.length === 0 && (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <PostSkeleton key={`skeleton-${index}`} />
                  ))}
                </>
              )}

              {/* Load More Button */}
              {hasMore && posts.length > 0 && (
                <div className="flex justify-center py-6">
                  <Button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cargando posts...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Cargar más posts
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* No more posts message */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    ¡Has visto todos los posts disponibles! 🎉
                  </p>
                </div>
              )}

              {/* Empty state */}
              {posts.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay posts disponibles</p>
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
