
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Bookmark, MessageCircle } from "lucide-react";
import PostCard from '@/components/post/PostCard';
import RecipeCard from '@/components/recipe/RecipeCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { useSavedContent } from '@/hooks/useSavedContent';

const Saved = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { savedPosts, savedRecipes, savedRestaurants, loading, refetch } = useSavedContent();

  const handleContentRemoved = () => {
    // Refrescar los datos cuando se elimine contenido
    refetch();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Contenido Guardado</h1>
        <p className="text-muted-foreground">
          Aquí puedes encontrar todo el contenido que has guardado para ver más tarde
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="posts">Posts ({savedPosts.length})</TabsTrigger>
          <TabsTrigger value="recipes">Recetas ({savedRecipes.length})</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurantes ({savedRestaurants.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : savedPosts.length > 0 ? (
            <div className="space-y-6">
              {savedPosts.map((post) => (
                <PostCard
                  key={post.id}
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
                  onPostDeleted={handleContentRemoved}
                  is_shared={post.is_shared}
                  shared_data={post.shared_data}
                />
              ))}
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  author={recipe.author}
                  authorUsername={recipe.authorUsername}
                  authorAvatar={recipe.authorAvatar}
                  authorId={recipe.authorId}
                  image={recipe.image_url}
                  prepTime={recipe.prepTime}
                  difficulty={recipe.difficulty}
                  rating={recipe.rating}
                  saves={recipe.saves}
                  cheersCount={recipe.cheersCount}
                  hasVideo={recipe.hasVideo}
                  onRecipeDeleted={handleContentRemoved}
                />
              ))}
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : savedRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  id={restaurant.id}
                  name={restaurant.name}
                  description={restaurant.description}
                  imageUrl={restaurant.imageUrl}
                  coverImageUrl={restaurant.coverImageUrl}
                  cuisineType={restaurant.cuisineType}
                  address={restaurant.address}
                  location={restaurant.location}
                  phone={restaurant.phone}
                  website={restaurant.website}
                  averageRating={restaurant.averageRating}
                  reviewsCount={restaurant.reviewsCount}
                  isVerified={restaurant.isVerified}
                />
              ))}
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
