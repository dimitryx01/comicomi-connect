
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import { CheersIcon } from './CheersIcon';
import { PostShareMenu } from './PostShareMenu';
import { SaveButton } from '@/components/ui/SaveButton';
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
  authorId?: string;
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
  authorName,
  authorId
}: PostActionsProps) => {
  const { sharedCount } = useSharedCount(postId, 'post');

  return (
    <div className="px-4 py-3 border-t border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCheer}
            disabled={cheersLoading || !currentUser}
            className={`text-muted-foreground hover:text-foreground transition-colors flex items-center ${
              hasCheered ? 'text-orange-500 hover:text-orange-600' : ''
            }`}
          >
            <CheersIcon 
              className={`h-5 w-5 transition-all duration-200 ${
                hasCheered ? 'text-orange-500 scale-110' : ''
              }`} 
              filled={hasCheered}
            />
            {cheersCount > 0 && <span className="ml-1 text-sm">{cheersCount}</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleComments}
            className="text-muted-foreground hover:text-foreground flex items-center"
          >
            <MessageCircle className="h-5 w-5" />
            {commentsCount > 0 && <span className="ml-1 text-sm">{commentsCount}</span>}
          </Button>

          <SaveButton
            contentId={postId}
            contentType="post"
            authorId={authorId}
          />

          <PostShareMenu
            postId={postId}
            postContent={postContent}
            authorName={authorName}
            contentType="post"
          />

          {/* Contador de compartidos para posts normales */}
          {sharedCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {sharedCount} compartido{sharedCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
