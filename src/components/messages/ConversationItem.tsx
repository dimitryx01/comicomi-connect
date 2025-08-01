import { memo } from 'react';
import { AvatarWithSignedUrl } from "@/components/ui/AvatarWithSignedUrl";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  partnerId: string;
  partnerName: string;
  partnerUsername: string;
  partnerAvatar: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  isSender: boolean;
  isSelected: boolean;
  isBlocked: boolean;
  onSelect: (partnerId: string, partnerName: string) => void;
  onBlock: (partnerId: string) => void;
  onUnblock: (partnerId: string) => void;
}

const ConversationItemComponent = ({
  partnerId,
  partnerName,
  partnerUsername,
  partnerAvatar,
  lastMessageText,
  lastMessageTime,
  unreadCount,
  isSender,
  isSelected,
  isBlocked,
  onSelect,
  onBlock,
  onUnblock
}: ConversationItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors",
        isSelected && "bg-accent"
      )}
      onClick={() => onSelect(partnerId, partnerName)}
    >
      <AvatarWithSignedUrl
        fileId={partnerAvatar}
        fallbackText={partnerName}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm truncate">
            {partnerName}
          </h4>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(lastMessageTime).toLocaleDateString()}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isBlocked ? (
                  <DropdownMenuItem onClick={() => onUnblock(partnerId)}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Desbloquear usuario
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onBlock(partnerId)}>
                    <UserX className="h-4 w-4 mr-2" />
                    Bloquear usuario
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {isSender && "Tú: "}{lastMessageText}
        </p>
        <p className="text-xs text-muted-foreground">
          @{partnerUsername}
        </p>
      </div>
    </div>
  );
};

export const ConversationItem = memo(ConversationItemComponent);