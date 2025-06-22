
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Edit,
  Trash2,
  Flag
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheersIcon } from './CheersIcon';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { SharedPostComments } from './SharedPostComments';
import { EditSharedPostDialog } from './EditSharedPostDialog';
import { useSharedPostCheers } from '@/hooks/useSharedPostCheers';
import { useSharedPostComments } from '@/hooks/useSharedPostComments';
import { useSharedPosts } from '@/hooks/useSharedPosts';
import { useAuth } from '@/contexts/AuthContext';
import { SharedPost } from '@/types/sharedPost';

interface SharedPostCardProps {
  sharedPost: SharedPost;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string) => void;
}

export const SharedPostCard = ({ sharedPost, onPostDeleted, onPostUpdated }: SharedPostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user } = useAuth();
  
  const { toggleCheer, hasCheered, cheersCount } = useSharedPostCheers(sharedPost.id);
  const { commentsCount } = useSharedPostComments(sharedPost.id);
  const { deleteSharedPost } = useSharedPosts();

  const isOwner = user?.id === sharedPost.sharer_id;

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación compartida?')) {
      const success = await deleteSharedPost(sharedPost.id);
      if (success && onPostDeleted) {
        onPostDeleted(sharedPost.id);
      }
    }
  };

  const handleReport = () => {
    // Implementar lógica de reporte
    console.log('Reportando publicación compartida:', sharedPost.id);
  };

  const render原始内容 = () => {
    const { original_content } = sharedPost;
    
    if (!original_content) {
      return (
        <div className="text-sm text-muted-foreground">
          Contenido no disponible
        </div>
      );
    }

    return (
      <div className="border rounded-lg p-3 bg-muted/20">
        {/* Original Author */}
        <div className="flex items-center space-x-2 mb-2">
          <AvatarWithSignedUrl
            fileId={original_content.author?.avatar_url}
            fallbackText={original_content.author?.full_name}
            size="sm"
          />
          <span className="text-xs font-medium">{original_content.author?.full_name}</span>
          <span className="text-xs text-muted-foreground">@{original_content.author?.username}</span>
        </div>

        {/* Original Content */}
        {sharedPost.shared_type === 'post' && (
          <>
            {original_content.content && (
              <p className="text-sm mb-2">{original_content.content}</p>
            )}
            {original_content.media_urls?.images && original_content.media_urls.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {original_content.media_urls.images.slice(0, 4).map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {sharedPost.shared_type === 'recipe' && (
          <>
            <h4 className="font-medium text-sm mb-1">{original_content.title}</h4>
            {original_content.description && (
              <p className="text-xs text-muted-foreground mb-2">{original_content.description}</p>
            )}
            {original_content.image_url && (
              <img
                src={original_content.image_url}
                alt={original_content.title}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
          </>
        )}

        {sharedPost.shared_type === 'restaurant' && (
          <>
            <h4 className="font-medium text-sm mb-1">{original_content.name}</h4>
            {original_content.description && (
              <p className="text-xs text-muted-foreground mb-2">{original_content.description}</p>
            )}
            {original_content.location && (
              <p className="text-xs text-muted-foreground mb-2">📍 {original_content.location}</p>
            )}
            {original_content.cover_image_url && (
              <img
                src={original_content.cover_image_url}
                alt={original_content.name}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <AvatarWithSignedUrl
              fileId={sharedPost.sharer.avatar_url}
              fallbackText={sharedPost.sharer.full_name}
              size="md"
            />
            <div>
              <h3 className="font-semibold text-sm">{sharedPost.sharer.full_name}</h3>
              <p className="text-xs text-muted-foreground">@{sharedPost.sharer.username}</p>
              <p className="text-xs text-muted-foreground">
                Compartió {sharedPost.shared_type === 'post' ? 'una publicación' : 
                          sharedPost.shared_type === 'recipe' ? 'una receta' : 'un restaurante'}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="mr-2 h-4 w-4" />
                  Reportar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Sharer's Comment */}
        {sharedPost.comment && (
          <p className="text-sm mb-3">{sharedPost.comment}</p>
        )}

        {/* Original Content */}
        {render原始内容()}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCheer()}
              className={`p-0 h-auto ${hasCheered ? 'text-orange-500' : 'text-muted-foreground'}`}
            >
              <CheersIcon className="h-4 w-4 mr-1 transform rotate-12" />
              {cheersCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {commentsCount}
            </Button>

            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <p>Función de compartir en desarrollo</p>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <SharedPostComments 
            sharedPostId={sharedPost.id}
            currentUser={user}
          />
        )}
      </CardContent>

      {/* Edit Dialog */}
      <EditSharedPostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        sharedPostId={sharedPost.id}
        currentComment={sharedPost.comment || ''}
        onSuccess={() => {
          setShowEditDialog(false);
          onPostUpdated?.(sharedPost.id);
        }}
      />
    </Card>
  );
};
