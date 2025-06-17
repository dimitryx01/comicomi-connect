import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { PostOptionsMenu } from './PostOptionsMenu';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { usePostActions } from '@/hooks/usePostActions';
import { useAuth } from '@/contexts/AuthContext';
import { EditPostDialog } from './EditPostDialog';
import { usePostEdit } from '@/hooks/usePostEdit';

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
  postContent?: string;
  postLocation?: string;
  postMediaUrls?: {
    images?: string[];
    videos?: string[];
  };
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
}

export const PostHeader = ({ 
  user, 
  restaurant, 
  createdAt, 
  postId, 
  postContent,
  postLocation,
  postMediaUrls,
  onPostDeleted,
  onPostUpdated 
}: PostHeaderProps) => {
  const { user: currentUser } = useAuth();
  const { savePost } = useSavedPosts();
  const { deletePost, reportPost } = usePostActions();
  const { editingPost, isEditDialogOpen, openEditDialog, closeEditDialog } = usePostEdit();

  const timeAgo = createdAt ? formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: es
  }) : '';

  const handleEdit = () => {
    if (postId && postContent !== undefined) {
      console.log('✏️ PostHeader: Iniciando edición de post:', postId);
      openEditDialog({
        id: postId,
        content: postContent,
        location: postLocation,
        mediaUrls: postMediaUrls
      });
    }
  };

  const handleDelete = async () => {
    if (postId && window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      // Pasar la función de callback para actualización optimista
      await deletePost(postId, user.id, onPostDeleted);
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

  const handlePostUpdated = () => {
    console.log('✅ PostHeader: Post actualizado, notificando cambios...');
    closeEditDialog();
    onPostUpdated?.();
  };

  return (
    <>
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

      {/* Diálogo de edición */}
      {editingPost && (
        <EditPostDialog
          isOpen={isEditDialogOpen}
          onClose={closeEditDialog}
          post={editingPost}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </>
  );
};
