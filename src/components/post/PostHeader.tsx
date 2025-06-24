
import { useState, memo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, MoreHorizontal } from 'lucide-react';
import { PostOptionsMenu } from './PostOptionsMenu';
import { EditPostDialog } from './EditPostDialog';
import { UserLink } from '@/components/ui/UserLink';

interface PostUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface Restaurant {
  id: string;
  name: string;
}

interface PostHeaderProps {
  user: PostUser;
  restaurant?: Restaurant;
  createdAt: string;
  postId: string;
  postContent: string;
  postLocation?: string;
  postMediaUrls?: {
    images?: string[];
    videos?: string[];
  };
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: () => void;
}

export const PostHeader = memo(({ 
  user, 
  restaurant, 
  createdAt, 
  postId,
  postContent,
  postLocation,
  postMediaUrls,
  onPostDeleted,
  onPostUpdated
}: PostHeaderProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(createdAt), { 
    addSuffix: true, 
    locale: es 
  });

  const handleEditPost = () => {
    setShowEditDialog(true);
  };

  const handlePostUpdated = () => {
    setShowEditDialog(false);
    onPostUpdated?.();
  };

  console.log('🎨 PostHeader: Renderizando header para:', {
    userId: user.id,
    userName: user.name,
    username: user.username,
    hasRestaurant: !!restaurant
  });

  return (
    <>
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center space-x-3 flex-1">
          <UserLink username={user.username}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </UserLink>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <UserLink 
                username={user.username}
                displayName={user.name}
                className="font-semibold text-sm hover:underline"
              />
              <UserLink 
                username={user.username}
                className="text-muted-foreground text-sm hover:underline"
                showAt
              />
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>
            
            {restaurant && (
              <div className="flex items-center space-x-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{restaurant.name}</span>
              </div>
            )}
            
            {postLocation && !restaurant && (
              <div className="flex items-center space-x-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{postLocation}</span>
              </div>
            )}
          </div>
        </div>

        <PostOptionsMenu
          postId={postId}
          authorId={user.id}
          onEdit={handleEditPost}
          onDelete={onPostDeleted}
        />
      </div>

      <EditPostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        postId={postId}
        initialContent={postContent}
        initialLocation={postLocation}
        initialMediaUrls={postMediaUrls}
        onPostUpdated={handlePostUpdated}
      />
    </>
  );
});

PostHeader.displayName = 'PostHeader';
