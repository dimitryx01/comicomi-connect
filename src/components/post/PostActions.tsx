
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheersIcon } from './CheersIcon';
import { PostShareMenu } from './PostShareMenu';
import { useSharedCount } from '@/hooks/useSharedCount';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface PostActionsProps {
  cheersCount: number;
  hasCheered: boolean;
  cheersLoading: boolean;
  commentsCount: number;
  showComments: boolean;
  createdAt: string;
  currentUser: User | null;
  onToggleCheer: () => void;
  onToggleComments: () => void;
  postId: string;
  postContent: string;
  authorName: string;
}

export const PostActions = ({
  cheersCount,
  hasCheered,
  cheersLoading,
  commentsCount,
  showComments,
  createdAt,
  currentUser,
  onToggleCheer,
  onToggleComments,
  postId,
  postContent,
  authorName
}: PostActionsProps) => {
  const { sharedCount } = useSharedCount(postId, 'post');
  
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: es
  });

  return (
    <div className="px-4 py-3 border-t border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCheer}
            disabled={cheersLoading || !currentUser}
            className={`text-muted-foreground hover:text-foreground transition-colors ${
              hasCheered ? 'text-orange-500 hover:text-orange-600' : ''
            }`}
          >
            <CheersIcon 
              className={`h-4 w-4 mr-1 transition-all duration-200 ${
                hasCheered ? 'text-orange-500 scale-110' : ''
              }`} 
              filled={hasCheered}
            />
            {cheersCount > 0 && <span className="text-sm">{cheersCount}</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleComments}
            className="text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {commentsCount > 0 && <span className="text-sm">{commentsCount}</span>}
          </Button>

          <PostShareMenu
            postId={postId}
            postContent={postContent}
            authorName={authorName}
            contentType="post"
          />

          {/* Contador de compartidos */}
          {sharedCount > 0 && (
            <div className="text-xs text-muted-foreground">
              {sharedCount} compartido{sharedCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {timeAgo}
        </div>
      </div>
    </div>
  );
};
