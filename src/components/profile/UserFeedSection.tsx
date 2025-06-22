
import { memo } from 'react';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';
import PostCard from '@/components/post/PostCard';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import { CombinedFeedItem } from '@/hooks/useUserFeed';

interface UserFeedSectionProps {
  feedItems: CombinedFeedItem[];
  loading: boolean;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string) => void;
}

export const UserFeedSection = memo(({ 
  feedItems, 
  loading, 
  onPostDeleted, 
  onPostUpdated 
}: UserFeedSectionProps) => {
  console.log('🎨 UserFeedSection: Renderizando feed del usuario:', {
    itemsCount: feedItems.length,
    loading,
    breakdown: {
      posts: feedItems.filter(item => item.type === 'post').length,
      sharedPosts: feedItems.filter(item => item.type === 'shared_post').length
    },
    timestamp: new Date().toISOString()
  });

  if (loading) {
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

  if (feedItems.length === 0) {
    console.log('📭 UserFeedSection: Feed vacío, mostrando mensaje...');
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No hay publicaciones aún.</p>
      </div>
    );
  }

  console.log('✅ UserFeedSection: Renderizando', feedItems.length, 'items del feed');

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
              onPostDeleted={onPostDeleted}
            />
          );
        } else if (feedItem.type === 'shared_post') {
          const sharedPost = feedItem.data as SharedPost;
          return (
            <SharedPostCard
              key={feedItem.id}
              sharedPost={sharedPost}
              onPostDeleted={onPostDeleted}
              onPostUpdated={onPostUpdated}
            />
          );
        }

        return null;
      })}
    </div>
  );
});

UserFeedSection.displayName = 'UserFeedSection';
