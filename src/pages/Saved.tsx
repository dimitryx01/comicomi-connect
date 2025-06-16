
import { useState } from 'react';
import { Heart, Bookmark, ChefHat, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/post/PostCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import RecipeCard from '@/components/recipe/RecipeCard';
import { posts, restaurants } from '@/data/mockData';

const Saved = () => {
  // Mock saved data
  const savedRecipes = [
    {
      id: '1',
      title: 'Classic Margherita Pizza',
      author: 'Chef Mario',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      prepTime: 30,
      difficulty: 'Medium',
      rating: 4.8,
      saves: 234
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Saved Items</h1>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Recipes
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Restaurants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6 mt-6">
          {posts.slice(0, 2).map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </TabsContent>

        <TabsContent value="recipes" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restaurants" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurants.slice(0, 2).map((restaurant) => (
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
  );
};

export default Saved;
