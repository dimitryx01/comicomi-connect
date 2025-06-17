
import { Button } from "@/components/ui/button";
import { MessageCircle, Share2 } from "lucide-react";
import { cn } from '@/lib/utils';
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
  onToggleComments
}: PostActionsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="p-3 sm:p-4 pt-2 flex items-center justify-between">
      <div className="flex items-center space-x-4 sm:space-x-6">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto"
          onClick={onToggleCheer}
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
          onClick={onToggleComments}
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
    </div>
  );
};
