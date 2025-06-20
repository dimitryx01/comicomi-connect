import { MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PostShareMenu } from './PostShareMenu';
import { CheersIcon } from './CheersIcon';

interface PostActionsProps {
  cheersCount: number;
  hasCheered: boolean;
  cheersLoading: boolean;
  commentsCount: number;
  showComments: boolean;
  createdAt: string;
  currentUser: any;
  onToggleCheer: () => void;
  onToggleComments: () => void;
  postId?: string;
  postContent?: string;
  authorName?: string;
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
  postContent = '',
  authorName = ''
}: PostActionsProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: es
  });

  return (
    <div className="px-4 py-2 border-t border-border/50">
      {/* Action Buttons */}
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

          {postId && (
            <PostShareMenu
              postId={postId}
              postContent={postContent}
              authorName={authorName}
            />
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
