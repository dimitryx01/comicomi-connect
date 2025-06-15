
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import RecipeCard from '@/components/recipe/RecipeCard';
import { posts, restaurants } from '@/data/mockData';

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock recipes data
  const recipes = [
    {
      id: '1',
      title: 'Classic Margherita Pizza',
      author: 'Chef Mario',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      prepTime: 30,
      difficulty: 'Medium',
      rating: 4.8,
      saves: 234
    },
    {
      id: '2',
      title: 'Homemade Pasta Carbonara',
      author: 'Isabella Romano',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d286?w=400',
      prepTime: 20,
      difficulty: 'Easy',
      rating: 4.9,
      saves: 156
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Discover</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for recipes, restaurants, or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} {...restaurant} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discover;
