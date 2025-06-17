import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MessageCircle, Share2, MoreHorizontal, Tag, Send } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { useComments } from '@/hooks/useComments';
import { useCheers } from '@/hooks/useCheers';
import { useAuth } from '@/contexts/AuthContext';
import { LazyImage } from '@/components/ui/LazyImage';

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
  createdAt,
  restaurant,
}: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const { user: currentUser } = useAuth();
  const { comments, commentsCount, loading: commentsLoading, addComment } = useComments(id);
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useCheers(id);

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (newComment.trim() && currentUser) {
      const success = await addComment(newComment);
      if (success) {
        setNewComment('');
      }
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

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'ahora';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  // Copa inclinada SVG icon
  const CheersIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
      <path d="M11 12V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
      <path d="M3 19h18l-2-7H5z" />
      <path d="M12 12v7" />
    </svg>
  );

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

        {/* Post Media con Lazy Loading */}
        {imageUrl && (
          <div className="relative w-full">
            <AspectRatio ratio={4/3} className="bg-muted">
              <LazyImage
                src={imageUrl}
                alt="Post"
                className="object-cover w-full h-full rounded-none"
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
                loading="lazy"
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
            onClick={toggleCheer}
            disabled={cheersLoading || !currentUser}
          >
            <CheersIcon
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 mr-1 transform rotate-12",
                hasCheered ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
              )}
            />
            <span className="text-xs sm:text-sm">{cheersCount}</span>
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
            <span className="text-xs sm:text-sm">{commentsCount}</span>
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
            {/* Add Comment Input - Only show if user is authenticated */}
            {currentUser && (
              <div className="flex items-center space-x-2 mb-4">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarImage src={currentUser.user_metadata?.avatar_url || ''} alt="You" />
                  <AvatarFallback className="text-xs">
                    {currentUser.user_metadata?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center space-x-2">
                  <Input
                    placeholder="Agregar un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-sm"
                    disabled={commentsLoading}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || commentsLoading}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src={comment.user_avatar_url} alt={comment.user_full_name} />
                    <AvatarFallback className="text-xs">{comment.user_full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-background rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-xs sm:text-sm font-medium truncate">{comment.user_full_name}</h4>
                        <span className="text-xs text-muted-foreground">{formatCommentDate(comment.created_at)}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 px-3">
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-muted-foreground">
                        <CheersIcon className="h-3 w-3 mr-1 transform rotate-12" />
                        {comment.cheers_count}
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-muted-foreground">
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
