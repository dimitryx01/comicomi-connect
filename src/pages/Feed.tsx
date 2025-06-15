
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import PostCard from '@/components/post/PostCard';
import CreatePostForm from '@/components/post/CreatePostForm';
import { posts } from '@/data/mockData';

const Feed = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Trending Topics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Nearby Restaurants
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Recipe Ideas
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed - Center column */}
        <div className="lg:col-span-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold">Your Feed</h1>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Create Post</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl mx-4">
                  <CreatePostForm onSuccess={() => setIsCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Suggestions</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New Restaurant</p>
                    <p className="text-xs text-muted-foreground">Near you</p>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Food Blogger</p>
                    <p className="text-xs text-muted-foreground">@foodie123</p>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </div>
              </div>
            </div>

            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Trending</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">#FoodTrends</p>
                  <p className="text-xs text-muted-foreground">2.1K posts</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">#LocalEats</p>
                  <p className="text-xs text-muted-foreground">1.8K posts</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">#RecipeShare</p>
                  <p className="text-xs text-muted-foreground">956 posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
