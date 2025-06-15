import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Calendar, Settings, LogOut } from "lucide-react";
import PageLayout from '@/components/layout/PageLayout';
import { users, posts } from '@/data/mockData';
import PostCard from '@/components/post/PostCard';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchUserProfile = () => {
      setLoading(true);
      try {
        // Let's use the first user in our mock data
        const userData = users[0];
        setUser(userData);
        
        // Find posts by this user
        const userPosts = posts.filter(post => post.user.id === userData.id);
        setUserPosts(userPosts);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-medium mb-2">User not found</h2>
          <p className="text-muted-foreground">
            The user profile you're looking for doesn't exist.
          </p>
        </div>
      </PageLayout>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const joinDate = new Date(2022, 3, 15); // Mock join date: April 15, 2022

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-6">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-primary/30 to-primary/10"></div>

          {/* Profile Info */}
          <div className="relative flex flex-col md:flex-row md:items-end px-4 -mt-16 md:-mt-20">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 mt-4 md:mt-0 md:ml-6 md:pb-4">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
            
            <div className="mt-4 md:mt-0 md:pb-4 flex space-x-3">
              <Button variant="outline" size="sm" className="rounded-full">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1 border-none shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="font-medium">About</h2>
                  <p className="text-sm text-muted-foreground mt-2">{user.bio}</p>
                </div>
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user.city}, {user.country}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Joined {formatDate(joinDate)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h2 className="font-medium mb-4">Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{user.followers}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.following}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userPosts.length}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="mt-6">
                {userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <PostCard key={post.id} {...post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No posts yet.</p>
                    <Button className="mt-4" asChild>
                      <Link to="/create">Create a Post</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No reviews yet.</p>
                  <Button className="mt-4" asChild>
                    <Link to="/restaurants">Discover Restaurants</Link>
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="saved" className="mt-6">
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No saved posts or restaurants yet.</p>
                  <Button className="mt-4" asChild>
                    <Link to="/">Explore Feed</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
