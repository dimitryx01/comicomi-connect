
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import PostCard from '@/components/post/PostCard';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { posts, restaurants } from '@/data/mockData';
import CreatePostForm from '@/components/post/CreatePostForm';
import { ExternalLink, ChevronRight } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('feed');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Check if the welcome message has been shown before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  return (
    <PageLayout isAuthenticated={isAuthenticated}>
      <div className="max-w-4xl mx-auto">
        {!isAuthenticated && showWelcome && (
          <div className="relative mb-8 overflow-hidden rounded-xl glass animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
            <div className="relative z-10 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Welcome to comicomi</h1>
                  <p className="mt-2 text-muted-foreground max-w-2xl">
                    Connect with food lovers, discover new restaurants, and share your culinary experiences.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                  <Link to="/register">
                    <Button>Get Started</Button>
                  </Link>
                  <Button variant="outline" onClick={dismissWelcome}>Dismiss</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {isAuthenticated && (
            <div className="bg-card rounded-xl shadow-sm border p-4 animate-fade-in">
              <CreatePostForm />
            </div>
          )}

          <Tabs defaultValue="feed" value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="space-y-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id}
                  {...post}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="discover" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium">Popular Restaurants</h2>
                  <Link to="/restaurants" className="flex items-center text-sm text-primary">
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard 
                      key={restaurant.id}
                      {...restaurant}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium">Popular Posts</h2>
                  <Link to="/explore" className="flex items-center text-sm text-primary">
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {posts.slice(0, 2).map((post) => (
                    <PostCard 
                      key={post.id}
                      {...post}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
