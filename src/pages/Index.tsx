
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChefHat, Users, MapPin, Heart } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/feed');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to feed
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-20 space-y-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <ChefHat className="h-12 w-12 text-primary" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            comicomi
          </h1>
        </div>
        
        <h2 className="text-4xl font-bold text-balance">
          Where Food Lovers Connect
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          Share recipes, discover restaurants, connect with fellow food enthusiasts, 
          and build your culinary community.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" onClick={() => navigate('/register')} className="text-lg px-8">
            Join comicomi
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/discover')} className="text-lg px-8">
            Explore
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Share Recipes</h3>
          <p className="text-muted-foreground">
            Create and share your favorite recipes with detailed instructions and beautiful photos.
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Discover Restaurants</h3>
          <p className="text-muted-foreground">
            Find and review amazing restaurants in your area and around the world.
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Connect with Community</h3>
          <p className="text-muted-foreground">
            Follow other food lovers, share experiences, and build lasting connections.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-card border rounded-2xl p-12 text-center space-y-6">
        <h3 className="text-3xl font-bold">Ready to Start Your Culinary Journey?</h3>
        <p className="text-muted-foreground text-lg">
          Join thousands of food enthusiasts already sharing their passion on comicomi.
        </p>
        <Button size="lg" onClick={() => navigate('/register')} className="text-lg px-8">
          Get Started Today
        </Button>
      </div>
    </div>
  );
};

export default Index;
