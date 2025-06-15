
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Tag, Send } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
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

// Mock comments data
const mockComments = [
  {
    id: '1',
    user: {
      id: '2',
      name: 'Maria Garcia',
      username: 'maria_chef',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
    },
    content: '¡Se ve delicioso! ¿Podrías compartir la receta?',
    createdAt: '2h',
    likes: 3
  },
  {
    id: '2',
    user: {
      id: '3',
      name: 'Carlos Rodriguez',
      username: 'carlos_foodie',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    content: 'Tengo que probar este lugar pronto',
    createdAt: '1h',
    likes: 1
  }
];

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
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Aquí agregarías la lógica para enviar el comentario
      console.log('Nuevo comentario:', newComment);
      setNewComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddComment();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden animate-scale-in mb-4 w-full">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="flex items-center justify-between p-3 sm:p-4">
          <Link to={`/profile/${user.id}`} className="flex items-center space-x-2 min-w-0 flex-1">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs sm:text-sm">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-xs sm:text-sm truncate">{user.name}</h3>
              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            </div>
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {restaurant && (
              <Link
                to={`/restaurant/${restaurant.id}`}
                className="flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground max-w-[120px] sm:max-w-none"
              >
                <Tag className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{restaurant.name}</span>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Post Content */}
        <div className="px-3 sm:px-4 pb-3">
          <p className="text-sm whitespace-pre-line break-words">{content}</p>
        </div>

        {/* Post Media */}
        {imageUrl && (
          <div className="relative w-full">
            <AspectRatio ratio={4/3} className="bg-muted">
              <img
                src={imageUrl}
                alt="Post"
                className="object-cover w-full h-full rounded-none"
                loading="lazy"
              />
            </AspectRatio>
          </div>
        )}
        
        {videoUrl && (
          <div className="relative w-full">
            <AspectRatio ratio={16/9} className="bg-muted">
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-cover rounded-none"
                preload="metadata"
              />
            </AspectRatio>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-2 flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={handleLike}
          >
            <Heart
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 mr-1",
                liked ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
            <span className="text-xs sm:text-sm">{likeCount}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto"
            onClick={handleToggleComments}
          >
            <MessageCircle className={cn(
              "h-4 w-4 sm:h-5 sm:w-5 mr-1",
              showComments ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-xs sm:text-sm">{comments}</span>
          </Button>

          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </Button>
        </div>

        <span className="text-xs text-muted-foreground">
          {formatDate(createdAt)}
        </span>
      </CardFooter>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t bg-muted/30 animate-accordion-down">
          <div className="p-3 sm:p-4">
            {/* Add Comment Input */}
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                <AvatarImage src="" alt="You" />
                <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Agregar un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-sm"
                />
                <Button 
                  size="sm" 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {mockComments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    <AvatarFallback className="text-xs">{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-background rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-xs sm:text-sm font-medium truncate">{comment.user.name}</h4>
                        <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 px-3">
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-muted-foreground">
                        <Heart className="h-3 w-3 mr-1" />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-muted-foreground">
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
