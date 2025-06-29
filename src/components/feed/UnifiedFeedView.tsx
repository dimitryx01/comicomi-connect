import { memo, useCallback } from 'react';
import { useUnifiedFeed } from '@/hooks/useUnifiedFeed';
import { usePostCreationOptimized } from '@/hooks/posts/usePostCreationOptimized';
import PostCard from '@/components/post/PostCard';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import { PostSkeleton } from '@/components/post/PostSkeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CreatePostForm from '@/components/post/CreatePostForm';
import { useState } from 'react';

export const UnifiedFeedView = memo(() => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [optimisticPosts, setOptimisticPosts] = useState<any[]>([]);
  
  const { 
    feedItems, 
    loading, 
    hasMore, 
    loadMore, 
    isFetchingMore, 
    refreshFeed, 
    invalidateAndRefresh,
    isEmpty,
    isError,
    error 
  } = useUnifiedFeed();

  const { createPost } = usePostCreationOptimized();

  console.log('🎨 UnifiedFeedView: Rendering feed view:', {
    feedItemsCount: feedItems.length,
    optimisticPostsCount: optimisticPosts.length,
    loading,
    isEmpty,
    isError,
    timestamp: new Date().toISOString()
  });

  const handleOptimisticPostCreate = useCallback((newPost: any) => {
    console.log('⚡ UnifiedFeedView: Adding optimistic post:', newPost.id);
    setOptimisticPosts(prev => [newPost, ...prev]);
    
    // Remover el post optimista después de un tiempo para que aparezca el real
    setTimeout(() => {
      console.log('🧹 UnifiedFeedView: Cleaning optimistic post:', newPost.id);
      setOptimisticPosts(prev => prev.filter(p => p.id !== newPost.id));
    }, 3000);
  }, []);

  const handlePostDeleted = useCallback((postId: string) => {
    console.log('🗑️ UnifiedFeedView: Post deleted:', postId);
    invalidateAndRefresh();
  }, [invalidateAndRefresh]);

  const handlePostUpdated = useCallback(() => {
    console.log('✏️ UnifiedFeedView: Post updated');
    invalidateAndRefresh();
  }, [invalidateAndRefresh]);

  const handleCreatePostSuccess = useCallback(() => {
    console.log('✅ UnifiedFeedView: Post creation success callback');
    setCreateDialogOpen(false);
    // La invalidación se maneja en usePostCreationOptimized
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 UnifiedFeedView: Manual refresh triggered');
    setOptimisticPosts([]); // Limpiar posts optimistas
    await refreshFeed();
  }, [refreshFeed]);

  // Combinar posts optimistas con el feed real
  const allPosts = [...optimisticPosts, ...feedItems];

  if (isError) {
    console.error('❌ UnifiedFeedView: Feed error:', error);
    return (
      <div className="text-center py-10">
        <p className="text-destructive mb-4">Error al cargar el feed</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (loading && feedItems.length === 0) {
    console.log('⏳ UnifiedFeedView: Showing initial loading skeletons');
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isEmpty && optimisticPosts.length === 0) {
    console.log('📭 UnifiedFeedView: Feed is empty');
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No hay publicaciones en el feed.</p>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera publicación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreatePostForm onSuccess={handleCreatePostSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  console.log('✅ UnifiedFeedView: Rendering feed with', allPosts.length, 'items');

  return (
    <div className="space-y-4">
      {/* Botón de refresh */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Crear Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CreatePostForm onSuccess={handleCreatePostSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts del feed */}
      {allPosts.map((feedItem, index) => {
        // Para posts optimistas (objetos simples)
        if (!feedItem.type) {
          console.log('⚡ UnifiedFeedView: Rendering optimistic post:', feedItem.id);
          return (
            <div key={`optimistic-${feedItem.id}`} className="opacity-75">
              <PostCard
                id={feedItem.id}
                user={{
                  id: feedItem.author_id,
                  name: feedItem.author_name,
                  username: feedItem.author_username,
                  avatar: feedItem.author_avatar
                }}
                content={feedItem.content}
                mediaUrls={feedItem.media_urls}
                likes={feedItem.cheers_count}
                comments={feedItem.comments_count}
                createdAt={feedItem.created_at}
                isLiked={false}
                location={feedItem.location}
                restaurant={feedItem.restaurant_id ? {
                  id: feedItem.restaurant_id,
                  name: feedItem.restaurant_name
                } : undefined}
                onPostDeleted={handlePostDeleted}
              />
            </div>
          );
        }

        // Para posts normales del feed
        if (feedItem.type === 'post') {
          const post = feedItem.data as Post;
          console.log('📝 UnifiedFeedView: Rendering normal post:', post.id);
          return (
            <PostCard
              key={feedItem.id}
              id={post.id}
              user={{
                id: post.author_id,
                name: post.author_name,
                username: post.author_username,
                avatar: post.author_avatar
              }}
              content={post.content}
              mediaUrls={post.media_urls}
              likes={post.cheers_count}
              comments={post.comments_count}
              createdAt={post.created_at}
              isLiked={false}
              location={post.location}
              restaurant={post.restaurant_id ? {
                id: post.restaurant_id,
                name: post.restaurant_name
              } : undefined}
              onPostDeleted={handlePostDeleted}
            />
          );
        }

        // Para posts compartidos
        if (feedItem.type === 'shared_post') {
          const sharedPost = feedItem.data as SharedPost;
          console.log('🔄 UnifiedFeedView: Rendering shared post:', sharedPost.id);
          return (
            <SharedPostCard
              key={feedItem.id}
              sharedPost={sharedPost}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          );
        }

        return null;
      })}

      {/* Botón cargar más */}
      {hasMore && (
        <div className="text-center py-4">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={isFetchingMore}
          >
            {isFetchingMore ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar más'
            )}
          </Button>
        </div>
      )}

      {/* Loading más posts */}
      {isFetchingMore && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <PostSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}
    </div>
  );
});

UnifiedFeedView.displayName = 'UnifiedFeedView';
