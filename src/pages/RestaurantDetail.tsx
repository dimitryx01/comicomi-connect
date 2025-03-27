
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import PageLayout from '@/components/layout/PageLayout';
import { restaurants, posts } from '@/data/mockData';
import PostCard from '@/components/post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Clock, Phone, Globe, Star, ArrowLeft } from "lucide-react";

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchRestaurant = () => {
      setLoading(true);
      try {
        const restaurantData = restaurants.find(r => r.id === id);
        if (restaurantData) {
          setRestaurant(restaurantData);
          
          // Find posts that mention this restaurant
          const restaurantPosts = posts.filter(
            post => post.restaurant && post.restaurant.id === id
          );
          setRelatedPosts(restaurantPosts);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load restaurant details."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, toast]);

  if (loading) {
    return (
      <PageLayout isAuthenticated={isAuthenticated}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading restaurant details...</p>
        </div>
      </PageLayout>
    );
  }

  if (!restaurant) {
    return (
      <PageLayout isAuthenticated={isAuthenticated}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-medium mb-2">Restaurant not found</h2>
          <p className="text-muted-foreground mb-6">
            The restaurant you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button>Return to home</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout isAuthenticated={isAuthenticated}>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center text-muted-foreground mb-6 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>
        
        <div className="relative h-60 md:h-80 rounded-xl overflow-hidden mb-6">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(restaurant.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : i < restaurant.rating
                        ? "fill-yellow-400 text-yellow-400 fill-opacity-50"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-white">
                {restaurant.rating.toFixed(1)} ({restaurant.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-medium mb-4">About</h2>
              <p className="text-muted-foreground mb-6">
                {restaurant.description}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{restaurant.location}</span>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{restaurant.hours}</span>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{restaurant.phone}</span>
                </div>
                <div className="flex items-start">
                  <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                  <a
                    href={`https://${restaurant.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {restaurant.website}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-medium mb-4">Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tuesday</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wednesday</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thursday</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Friday</span>
                  <span>11:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span>10:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span>10:00 AM - 10:00 PM</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full">
                  Write a Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            {relatedPosts.length > 0 ? (
              <div className="space-y-4">
                {relatedPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No posts yet for this restaurant.</p>
                {isAuthenticated && (
                  <Button className="mt-4" asChild>
                    <Link to="/create">Create a Post</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="text-center py-10">
              <p className="text-muted-foreground">No reviews yet for this restaurant.</p>
              {isAuthenticated && (
                <Button className="mt-4">
                  Write a Review
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default RestaurantDetail;
