
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { CheersIcon } from './CheersIcon';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar_url: string;
  cheers_count: number;
}

interface PostCommentsProps {
  comments: Comment[];
  currentUser: any;
  commentsLoading: boolean;
  onAddComment: (content: string) => Promise<boolean>;
}

export const PostComments = ({ comments, currentUser, commentsLoading, onAddComment }: PostCommentsProps) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    if (newComment.trim() && currentUser) {
      const success = await onAddComment(newComment);
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

  return (
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
  );
};
