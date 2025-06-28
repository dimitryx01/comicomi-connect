
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { usePersonalizedFeed, PersonalizedFeedItem } from '@/hooks/usePersonalizedFeed';
import PostCard from '@/components/post/PostCard';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import RecipeCard from '@/components/recipe/RecipeCard';

export const PersonalizedFeedView = memo(() => {
  const {
    feedItems,
    loading,
    hasMore,
    loadMore,
    isFetchingMore,
    refreshFeed,
    isEmpty
  } = usePersonalizedFeed({ pageSize: 10 });

  console.log('🎨 PersonalizedFeedView: Renderizando feed personalizado:', {
    itemsCount: feedItems.length,
    loading,
    hasMore,
    isEmpty,
    breakdown: {
      posts: feedItems.filter(item => item.content_type === 'post').length,
      sharedPosts: feedItems.filter(item => item.content_type === 'shared_post').length,
      recipes: feedItems.filter(item => item.content_type === 'recipe').length
    }
  });

  if (loading && feedItems.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold mb-2">Tu feed personalizado está vacío</h3>
          <p className="text-muted-foreground mb-6">
            Sigue a otros usuarios y restaurantes para ver contenido personalizado aquí.
            También puedes explorar contenido en las secciones de Descubrir.
          </p>
          <Button onClick={refreshFeed} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar feed
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del feed */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Para ti</h2>
          <p className="text-muted-foreground">
            Contenido personalizado basado en tus seguimientos e intereses
          </p>
        </div>
        <Button onClick={refreshFeed} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Feed items */}
      <div className="space-y-6">
        {feedItems.map((feedItem: PersonalizedFeedItem) => {
          const key = `${feedItem.content_type}-${feedItem.content_id}`;
          
          console.log('🎯 PersonalizedFeedView: Renderizando item:', {
            type: feedItem.content_type,
            id: feedItem.content_id,
            relevanceScore: feedItem.relevance_score
          });

          if (feedItem.content_type === 'post') {
            const postData = feedItem.content_data;
            return (
              <PostCard
                key={key}
                id={postData.id}
                user={{
                  id: postData.author_id,
                  name: postData.author_name,
                  username: postData.author_username,
                  avatar: postData.author_avatar
                }}
                content={postData.content}
                mediaUrls={postData.media_urls}
                likes={0} // Will be fetched by PostCard
                comments={0} // Will be fetched by PostCard
                createdAt={postData.created_at}
                isLiked={false}
                location={postData.location}
                restaurant={postData.restaurant_id ? {
                  id: postData.restaurant_id,
                  name: postData.restaurant_name
                } : undefined}
              />
            );
          } else if (feedItem.content_type === 'shared_post') {
            const sharedPostData = feedItem.content_data;
            const mockSharedPost = {
              id: sharedPostData.id,
              sharer_id: sharedPostData.sharer_id,
              shared_type: sharedPostData.shared_type as 'post' | 'recipe' | 'restaurant',
              shared_post_id: null,
              shared_recipe_id: null,
              shared_restaurant_id: null,
              comment: sharedPostData.comment,
              created_at: sharedPostData.created_at,
              updated_at: sharedPostData.created_at,
              sharer: {
                id: sharedPostData.sharer_id,
                full_name: sharedPostData.sharer_name,
                username: sharedPostData.sharer_username,
                avatar_url: sharedPostData.sharer_avatar
              },
              original_content: null,
              cheers_count: 0,
              comments_count: 0,
              has_cheered: false
            };

            return (
              <SharedPostCard
                key={key}
                sharedPost={mockSharedPost}
              />
            );
          } else if (feedItem.content_type === 'recipe') {
            const recipeData = feedItem.content_data;
            return (
              <RecipeCard
                key={key}
                id={recipeData.id}
                title={recipeData.title}
                description={recipeData.description}
                imageUrl={recipeData.image_url}
                authorName={recipeData.author_name}
                authorUsername={recipeData.author_username}
                authorAvatar={recipeData.author_avatar}
                cuisineType={recipeData.cuisine_type}
                difficulty={recipeData.difficulty}
                prepTime={recipeData.prep_time}
                cookTime={recipeData.cook_time}
                createdAt={recipeData.created_at}
                cheersCount={0}
                savesCount={0}
                isCheered={false}
                isSaved={false}
              />
            );
          }

          return null;
        })}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <Button
            onClick={loadMore}
            disabled={isFetchingMore}
            variant="outline"
            size="lg"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Ver más contenido'
            )}
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isFetchingMore && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Cargando más contenido...</p>
        </div>
      )}

      {/* End of feed message */}
      {!hasMore && feedItems.length > 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Has visto todo el contenido disponible
          </p>
        </div>
      )}
    </div>
  );
});

PersonalizedFeedView.displayName = 'PersonalizedFeedView';
