
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import RecipeCard from '@/components/recipe/RecipeCard';
import { restaurants } from '@/data/mockData';
import { useUnifiedFeed } from '@/hooks/useUnifiedFeed';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/post';
import { SharedPost } from '@/types/sharedPost';
import { SharedPostCard } from '@/components/post/SharedPostCard';

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  
  const { feedItems, loading: feedLoading } = useUnifiedFeed();
  const { recipes: realRecipes, loading: recipesLoading } = useRecipes();

  console.log('Discover - Feed items:', feedItems);
  console.log('Discover - Recipes:', realRecipes);
  console.log('Discover - isAuthenticated:', isAuthenticated);

  // Separar posts normales y compartidos del feed
  const normalPosts = feedItems
    .filter(item => item.type === 'post')
    .map(item => item.data as Post);

  const sharedPosts = feedItems
    .filter(item => item.type === 'shared_post')
    .map(item => item.data as SharedPost);

  // Combinar todos los posts para mostrar en la pestaña
  const allPosts = [...normalPosts, ...sharedPosts];

  const filteredPosts = allPosts.filter(post => {
    if ('content' in post) {
      // Post normal
      return post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      // Post compartido
      return (post.comment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.sharer.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  const filteredRecipes = realRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Descubrir</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar recetas, restaurantes o posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts ({filteredPosts.length})</TabsTrigger>
            <TabsTrigger value="recipes">Recetas ({filteredRecipes.length})</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurantes ({filteredRestaurants.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6 mt-6">
            {feedLoading ? (
              <div className="text-center py-8">
                <p>Cargando posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <p>No se encontraron posts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                {filteredPosts.map((post) => {
                  // Determinar si es un post compartido
                  if ('sharer_id' in post) {
                    // Es un SharedPost
                    const sharedPost = post as SharedPost;
                    return (
                      <SharedPostCard 
                        key={sharedPost.id}
                        sharedPost={sharedPost}
                      />
                    );
                  } else {
                    // Es un Post normal
                    const normalPost = post as Post;
                    return (
                      <PostCard 
                        key={normalPost.id} 
                        id={normalPost.id}
                        user={{
                          id: normalPost.author_id,
                          name: normalPost.author_name,
                          username: normalPost.author_username,
                          avatar: normalPost.author_avatar
                        }}
                        content={normalPost.content}
                        mediaUrls={normalPost.media_urls}
                        likes={normalPost.cheers_count}
                        comments={normalPost.comments_count}
                        createdAt={normalPost.created_at}
                        isLiked={false}
                        restaurant={normalPost.restaurant_id ? {
                          id: normalPost.restaurant_id,
                          name: normalPost.restaurant_name
                        } : undefined}
                      />
                    );
                  }
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recipes" className="space-y-6 mt-6">
            {recipesLoading ? (
              <div className="text-center py-8">
                <p>Cargando recetas...</p>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-8">
                <p>No se encontraron recetas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    id={recipe.id}
                    title={recipe.title}
                    author={recipe.author_name}
                    image={recipe.image_url}
                    prepTime={recipe.prep_time + recipe.cook_time}
                    difficulty={recipe.difficulty}
                    rating={4.5}
                    saves={recipe.saves_count}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  id={restaurant.id}
                  name={restaurant.name}
                  cuisine={restaurant.cuisine}
                  rating={restaurant.rating}
                  imageUrl={restaurant.imageUrl}
                  location={restaurant.location}
                  reviewCount={restaurant.reviewCount}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Discover;
