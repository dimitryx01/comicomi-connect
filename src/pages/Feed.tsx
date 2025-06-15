
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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
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
  );
};

export default Feed;
