import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';
import PostCard from '@/components/post/PostCard';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import { CombinedFeedItem } from '@/hooks/useUserFeedPaginated';
import { Loader2 } from 'lucide-react';

interface UserFeedSectionProps {
  feedItems: CombinedFeedItem[];
  loading: boolean;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string) => void;
}

export const UserFeedSection = memo(({ 
  feedItems, 
  loading, 
  hasMore,
  isFetchingNextPage,
  onLoadMore,
  onPostDeleted, 
  onPostUpdated 
}: UserFeedSectionProps) => {
  console.log('🎨 UserFeedSection: Renderizando feed del usuario:', {
    itemsCount: feedItems.length,
    loading,
    hasMore,
    isFetchingNextPage,
    breakdown: {
      posts: feedItems.filter(item => item.type === 'post').length,
      sharedPosts: feedItems.filter(item => item.type === 'shared_post').length
    },
    timestamp: new Date().toISOString()
  });

  if (loading && feedItems.length === 0) {
    console.log('⏳ UserFeedSection: Mostrando skeleton loading...');
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (feedItems.length === 0 && !loading) {
    console.log('📭 UserFeedSection: Feed vacío, mostrando mensaje...');
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No hay publicaciones aún.</p>
      </div>
    );
  }

  console.log('✅ UserFeedSection: Renderizando', feedItems.length, 'items del feed');

  const handlePostDeleted = (postId?: string) => {
    console.log('🗑️ UserFeedSection: Post deleted', postId);
    // The parent component should handle the actual deletion logic
  };

  const handlePostUpdated = (postId?: string) => {
    console.log('✏️ UserFeedSection: Post updated', postId);
    // The parent component should handle the actual update logic
  };

  return (
    <div className="space-y-4">
      {feedItems.map((feedItem) => {
        console.log('🎯 UserFeedSection: Renderizando item:', {
          type: feedItem.type,
          id: feedItem.id,
          created_at: feedItem.created_at
        });

        if (feedItem.type === 'post') {
          const post = feedItem.data as Post;
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
        } else if (feedItem.type === 'shared_post') {
          const sharedPost = feedItem.data as SharedPost;
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

      {/* Botón "Cargar más" */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <Button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
            className="min-w-[120px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar más'
            )}
          </Button>
        </div>
      )}

      {/* Indicador de carga cuando se están obteniendo más posts */}
      {isFetchingNextPage && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Cargando más publicaciones...</p>
        </div>
      )}

      {/* Mensaje cuando no hay más posts */}
      {!hasMore && feedItems.length > 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Has visto todas las publicaciones
          </p>
        </div>
      )}
    </div>
  );
});

UserFeedSection.displayName = 'UserFeedSection';
