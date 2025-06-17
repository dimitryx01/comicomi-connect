
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Tag } from "lucide-react";

interface PostHeaderProps {
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  restaurant?: {
    id: string;
    name: string;
  };
}

export const PostHeader = ({ user, restaurant }: PostHeaderProps) => {
  return (
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
  );
};
