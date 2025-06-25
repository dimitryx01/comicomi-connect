
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Bookmark, MessageCircle } from "lucide-react";
import PostCard from '@/components/post/PostCard';
import RecipeCard from '@/components/recipe/RecipeCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { useSavedPosts } from '@/hooks/useSavedPosts';

const Saved = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { savedPosts, loading } = useSavedPosts();

  // Mock data for saved recipes and restaurants
  const savedRecipes = [
    {
      id: "1",
      title: "Paella Valenciana Tradicional",
      author: "Chef María García",
      authorUsername: "maria_chef",
      authorAvatar: "",
      image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop",
      prepTime: 45,
      difficulty: "Medio",
      rating: 4.8,
      saves: 234,
      cheersCount: 89,
      hasVideo: true
    },
  ];

  const savedRestaurants = [
    {
      id: "1",
      name: "La Terraza Mediterránea",
      location: "Centro Histórico, Madrid",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      rating: 4.5,
      priceRange: "€€€",
      cuisineType: "Mediterránea"
    },
  ];

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
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="recipes">Recetas</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
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
                    full_name: post.author?.full_name || 'Usuario',
                    username: post.author?.username || '',
                    avatar_url: post.author?.avatar_url || ''
                  }}
                  created_at={post.created_at}
                  media_urls={post.media_urls}
                  cheers_count={post.cheers_count || 0}
                  comments_count={post.comments_count || 0}
                  saves_count={post.saves_count || 0}
                  shares_count={post.shares_count || 0}
                  has_user_cheered={post.has_user_cheered || false}
                  has_user_saved={true}
                  restaurant={post.restaurant}
                  recipe={post.recipe}
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
          {savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  author={recipe.author}
                  authorUsername={recipe.authorUsername}
                  authorAvatar={recipe.authorAvatar}
                  image={recipe.image}
                  prepTime={recipe.prepTime}
                  difficulty={recipe.difficulty}
                  rating={recipe.rating}
                  saves={recipe.saves}
                  cheersCount={recipe.cheersCount}
                  hasVideo={recipe.hasVideo}
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
          {savedRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  id={restaurant.id}
                  name={restaurant.name}
                  location={restaurant.location}
                  image={restaurant.image}
                  rating={restaurant.rating}
                  priceRange={restaurant.priceRange}
                  cuisineType={restaurant.cuisineType}
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
