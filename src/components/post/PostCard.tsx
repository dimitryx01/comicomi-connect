
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Tag } from "lucide-react";
import { cn } from '@/lib/utils';

export interface PostProps {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  restaurant?: {
    id: string;
    name: string;
  };
  isLiked?: boolean;
}

const PostCard = ({
  id,
  user,
  content,
  imageUrl,
  videoUrl,
  likes,
  comments,
  createdAt,
  restaurant,
  isLiked = false,
}: PostProps) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden animate-scale-in mb-4">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="flex items-center justify-between p-4">
          <Link to={`/profile/${user.id}`} className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">{user.name}</h3>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            {restaurant && (
              <Link
                to={`/restaurant/${restaurant.id}`}
                className="flex items-center px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
              >
                <Tag className="h-3 w-3 mr-1" />
                {restaurant.name}
              </Link>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-sm whitespace-pre-line">{content}</p>
        </div>

        {/* Post Media */}
        {imageUrl && (
          <div className="relative aspect-square w-full overflow-hidden">
            <img
              src={imageUrl}
              alt="Post"
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
        )}
        
        {videoUrl && (
          <div className="relative aspect-video w-full overflow-hidden">
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-full"
              preload="metadata"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={handleLike}
          >
            <Heart
              className={cn(
                "h-5 w-5 mr-1",
                liked ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
            <span className="text-xs">{likeCount}</span>
          </Button>

          <Link to={`/post/${id}`} className="flex items-center">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <MessageCircle className="h-5 w-5 mr-1 text-muted-foreground" />
              <span className="text-xs">{comments}</span>
            </Button>
          </Link>

          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        <span className="text-xs text-muted-foreground">
          {formatDate(createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
