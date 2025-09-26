
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Bookmark, MessageCircle } from "lucide-react";
import PostCard from '@/components/post/PostCard';
import RecipeCard from '@/components/recipe/RecipeCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { SharedPostCard } from '@/components/post/SharedPostCard';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useSavedRestaurants } from '@/hooks/useSavedRestaurants';
import { useSavedSharedPosts } from '@/hooks/useSavedSharedPosts';

const Saved = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { savedPosts, loading: postsLoading } = useSavedPosts();
  const { savedRecipes, loading: recipesLoading } = useSavedRecipes();
  const { savedRestaurants, loading: restaurantsLoading } = useSavedRestaurants();
  const { savedSharedPosts, loading: sharedPostsLoading } = useSavedSharedPosts();

  console.log('🔍 Saved: Estado de carga:', {
    postsLoading,
    recipesLoading,
    restaurantsLoading,
    sharedPostsLoading,
    savedPostsCount: savedPosts.length,
    savedRecipesCount: savedRecipes.length,
    savedRestaurantsCount: savedRestaurants.length,
    savedSharedPostsCount: savedSharedPosts.length
  });

  // Combinar posts normales y compartidos de manera estable
  const allSavedPosts = [
    ...savedPosts.map(post => ({ ...post, type: 'normal', saved_at: post.created_at })),
    ...savedSharedPosts.map(shared => ({ 
      ...shared.shared_posts, 
      type: 'shared',
      saved_at: shared.created_at 
    }))
  ].sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());

  const allLoading = postsLoading || sharedPostsLoading;

  return (
    <div className="max-w-6xl mx-auto space-y-6 mobile-content">
      <div>
        <h1 className="text-3xl font-bold mb-2">Contenido Guardado</h1>
        <p className="text-muted-foreground">
          Aquí puedes encontrar todo el contenido que has guardado para ver más tarde
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="recipes">Recetas</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {allLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : allSavedPosts.length > 0 ? (
            <div className="space-y-6">
              {allSavedPosts.map((post) => {
                if (post.type === 'shared') {
                  // Crear objeto SharedPost para SharedPostCard
                  const sharedPost = {
                    id: post.id,
                    sharer_id: post.sharer_id,
                    shared_type: post.shared_type,
                    shared_post_id: post.shared_post_id,
                    shared_recipe_id: post.shared_recipe_id,
                    shared_restaurant_id: post.shared_restaurant_id,
                    comment: post.comment,
                    created_at: post.created_at,
                    updated_at: post.updated_at || post.created_at,
                    sharer: {
                      id: post.users?.id || post.sharer_id,
                      full_name: post.users?.full_name || 'Usuario',
                      username: post.users?.username || '',
                      avatar_url: post.users?.avatar_url || ''
                    },
                    original_content: null,
                    cheers_count: 0,
                    comments_count: 0,
                    has_cheered: false
                  };

                  return (
                    <SharedPostCard
                      key={`shared-${post.id}`}
                      sharedPost={sharedPost}
                    />
                  );
                } else {
                  // Post normal
                  return (
                    <PostCard
                      key={`normal-${post.id}`}
                      id={post.id}
                      content={post.content}
                      user={{
                        id: post.author?.id || '',
                        name: post.author?.full_name || 'Usuario',
                        username: post.author?.username || '',
                        avatar: post.author?.avatar_url || ''
                      }}
                      createdAt={post.created_at}
                      mediaUrls={{
                        images: Array.isArray(post.media_urls) ? post.media_urls.filter(url => typeof url === 'string') : [],
                        videos: []
                      }}
                      likes={post.cheers_count || 0}
                      comments={post.comments_count || 0}
                      isLiked={post.has_user_cheered || false}
                      restaurant={post.restaurant}
                    />
                  );
                }
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes posts guardados</h3>
              <p className="text-muted-foreground">
                Cuando guardes posts, aparecerán aquí para que puedas verlos más tarde
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recipes" className="space-y-6">
          {recipesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((saved) => {
                const recipe = saved.recipes;
                const author = recipe.users;
                return (
                  <RecipeCard
                    key={saved.id}
                    id={recipe.id}
                    title={recipe.title}
                    author={author?.full_name || 'Chef'}
                    authorUsername={author?.username || ''}
                    authorAvatar={author?.avatar_url || ''}
                    authorId={recipe.author_id}
                    image={recipe.image_url || ''}
                    prepTime={recipe.prep_time || 0}
                    difficulty={recipe.difficulty || 'Medio'}
                    rating={4.5}
                    saves={0}
                    cheersCount={0}
                    hasVideo={false}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes recetas guardadas</h3>
              <p className="text-muted-foreground">
                Explora recetas y guarda las que más te gusten
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6">
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : savedRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRestaurants.map((saved) => {
                const restaurant = saved.restaurants;
                return (
                  <RestaurantCard
                    key={saved.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    description={restaurant.description || ''}
                    imageUrl={restaurant.image_url || ''}
                    coverImageUrl={restaurant.cover_image_url || ''}
                    cuisineType={restaurant.cuisine_type || ''}
                    address={restaurant.address || ''}
                    location={restaurant.location || ''}
                    phone={restaurant.phone}
                    website={restaurant.website}
                    averageRating={4.0}
                    reviewsCount={0}
                    isVerified={restaurant.is_verified || false}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes restaurantes guardados</h3>
              <p className="text-muted-foreground">
                Descubre restaurantes y guarda tus favoritos
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Saved;
