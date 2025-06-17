
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { PostOptionsMenu } from './PostOptionsMenu';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { usePostActions } from '@/hooks/usePostActions';
import { useAuth } from '@/contexts/AuthContext';

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
  createdAt?: string;
  postId?: string;
}

export const PostHeader = ({ user, restaurant, createdAt, postId }: PostHeaderProps) => {
  const { user: currentUser } = useAuth();
  const { savePost } = useSavedPosts();
  const { deletePost, reportPost } = usePostActions();

  const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: es
  }) : '';

  const handleEdit = () => {
    // TODO: Implementar edición de posts
    console.log('Editar post:', postId);
  };

  const handleDelete = async () => {
    if (postId && window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      await deletePost(postId, user.id);
      // TODO: Refresh feed after deletion
    }
  };

  const handleSave = async () => {
    if (postId) {
      await savePost(postId);
    }
  };

  const handleReport = async () => {
    if (postId) {
      await reportPost(postId);
    }
  };

  return (
    <div className="flex items-start justify-between p-4 pb-2">
      <div className="flex items-center space-x-3">
        <AvatarWithSignedUrl
          fileId={user.avatar}
          fallbackText={user.name}
          className="h-10 w-10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {user.name}
            </h3>
            <span className="text-muted-foreground text-xs">
              @{user.username}
            </span>
          </div>
          {restaurant && (
            <p className="text-xs text-muted-foreground truncate">
              en {restaurant.name}
            </p>
          )}
          {timeAgo && (
            <p className="text-xs text-muted-foreground">
              {timeAgo}
            </p>
          )}
        </div>
      </div>
      
      {postId && (
        <PostOptionsMenu
          postId={postId}
          authorId={user.id}
          currentUserId={currentUser?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSave={handleSave}
          onReport={handleReport}
        />
      )}
    </div>
  );
};
