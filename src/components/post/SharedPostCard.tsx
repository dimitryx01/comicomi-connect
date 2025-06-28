
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { CheersIcon } from './CheersIcon';
import { PostShareMenu } from './PostShareMenu';
import { SaveButton } from '@/components/ui/SaveButton';
import { useSharedPostInteractions } from '@/hooks/useSharedPostInteractions';
import { useSharedPostComments } from '@/hooks/useSharedPostComments';
import { SharedPostComments } from './SharedPostComments';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { EditSharedPostDialog } from './EditSharedPostDialog';
import { SharedPost } from '@/types/sharedPost';

interface SharedPostCardProps {
  sharedPost: SharedPost;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
}

export const SharedPostCard = ({ 
  sharedPost, 
  onPostDeleted, 
  onPostUpdated 
}: SharedPostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const { 
    cheersCount, 
    commentsCount, 
    hasCheered, 
    loading, 
    toggleCheer,
    deleteSharedPost,
    addComment
  } = useSharedPostInteractions(sharedPost.id);

  const { comments, loading: commentsLoading, refreshComments } = useSharedPostComments(sharedPost.id);

  const isOwner = user && sharedPost.sharer_id === user.id;

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const success = await deleteSharedPost(sharedPost.id);
    if (success) {
      onPostDeleted?.();
    }
    setIsDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  // Convert user to match the expected interface
  const currentUser = user ? {
    id: user.id,
    name: (user as any).user_metadata?.full_name || (user as any).user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
    username: (user as any).user_metadata?.username || user.email?.split('@')[0] || 'usuario',
    avatar: (user as any).user_metadata?.avatar_url
  } : null;

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden mb-4 w-full">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={sharedPost.sharer?.avatar_url} />
              <AvatarFallback>
                {sharedPost.sharer?.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold">{sharedPost.sharer?.full_name}</div>
              <div className="text-xs text-muted-foreground">
                {sharedPost.shared_type === 'post' ? 'Compartió una publicación' :
                 sharedPost.shared_type === 'recipe' ? 'Compartió una receta' :
                 sharedPost.shared_type === 'restaurant' ? 'Compartió un restaurante' :
                 'Compartió contenido'}
              </div>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  disabled={loading}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Shared Content */}
        <div className="mt-4">
          {sharedPost.comment && (
            <div className="mb-3 text-sm">{sharedPost.comment}</div>
          )}

          {sharedPost.shared_type === 'post' && sharedPost.original_content && (
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="text-sm font-medium">Publicación original:</p>
              <p className="text-sm">{sharedPost.original_content.content}</p>
              {sharedPost.original_content.media_urls && sharedPost.original_content.media_urls.length > 0 && (
                <div className="mt-2">
                  {sharedPost.original_content.media_urls.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt="Contenido original" 
                      className="rounded-md max-w-full h-auto" 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {sharedPost.shared_type === 'recipe' && sharedPost.original_content && (
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="text-sm font-medium">Receta original:</p>
              <p className="text-sm">{sharedPost.original_content.title}</p>
              {sharedPost.original_content.image_url && (
                <img 
                  src={sharedPost.original_content.image_url} 
                  alt={sharedPost.original_content.title} 
                  className="mt-2 rounded-md" 
                />
              )}
            </div>
          )}

          {sharedPost.shared_type === 'restaurant' && sharedPost.original_content && (
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="text-sm font-medium">Restaurante original:</p>
              <p className="text-sm">{sharedPost.original_content.name}</p>
              {sharedPost.original_content.image_url && (
                <img 
                  src={sharedPost.original_content.image_url} 
                  alt={sharedPost.original_content.name} 
                  className="mt-2 rounded-md" 
                />
              )}
            </div>
          )}
        </div>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCheer}
            disabled={loading}
            className={`text-muted-foreground hover:text-foreground flex items-center ${
              hasCheered ? 'text-orange-500 hover:text-orange-600' : ''
            }`}
          >
            <CheersIcon 
              className={`h-4 w-4 ${hasCheered ? 'text-orange-500' : ''}`} 
              filled={hasCheered}
            />
            {cheersCount > 0 && <span className="ml-1 text-sm">{cheersCount}</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground hover:text-foreground flex items-center"
          >
            <MessageCircle className="h-4 w-4" />
            {commentsCount > 0 && <span className="ml-1 text-sm">{commentsCount}</span>}
          </Button>

          <SaveButton
            contentId={sharedPost.id}
            contentType="shared_post"
            authorId={sharedPost.sharer_id}
          />

          <PostShareMenu
            postId={sharedPost.id}
            postContent={sharedPost.comment || `Contenido compartido`}
            authorName={sharedPost.sharer?.full_name || 'Usuario'}
            contentType={sharedPost.shared_type}
          />
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <SharedPostComments 
          comments={comments}
          currentUser={currentUser}
          commentsLoading={commentsLoading}
          onAddComment={addComment}
          onRefreshComments={refreshComments}
        />
      )}
      </CardContent>

      {/* Edit Shared Post Dialog */}
      <EditSharedPostDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        sharedPostId={sharedPost.id}
        currentComment={sharedPost.comment || ''}
        onSuccess={onPostUpdated}
      />
    </Card>
  );
};
