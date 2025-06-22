
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
import { SimpleSharedPostComments } from './SimpleSharedPostComments';
import { EditSharedPostDialog } from './EditSharedPostDialog';
import { useSharedPostCheers } from '@/hooks/useSharedPostCheers';
import { useSharedPostComments } from '@/hooks/useSharedPostComments';
import { useSharedPosts } from '@/hooks/useSharedPosts';
import { useAuth } from '@/contexts/AuthContext';
import { SharedPost } from '@/types/sharedPost';
import { PostContent } from './PostContent';

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
    console.log('Reportando publicación compartida:', sharedPost.id);
  };

  const renderOriginalContent = () => {
    const { original_content } = sharedPost;
    
    if (!original_content) {
      return (
        <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/20">
          Contenido no disponible
        </div>
      );
    }

    return (
      <div className="border rounded-lg bg-muted/20 overflow-hidden">
        {/* Original Author Header */}
        <div className="flex items-center space-x-2 p-3 border-b bg-background/50">
          <AvatarWithSignedUrl
            fileId={original_content.author?.avatar_url}
            fallbackText={original_content.author?.full_name}
            size="sm"
          />
          <div>
            <span className="text-sm font-medium">{original_content.author?.full_name}</span>
            <span className="text-xs text-muted-foreground ml-2">@{original_content.author?.username}</span>
          </div>
        </div>

        {/* Original Content */}
        <div className="p-0">
          {sharedPost.shared_type === 'post' && (
            <PostContent 
              content={original_content.content || ''}
              mediaUrls={original_content.media_urls}
            />
          )}

          {sharedPost.shared_type === 'recipe' && (
            <div className="p-3">
              <h4 className="font-medium text-sm mb-2">{original_content.title}</h4>
              {original_content.description && (
                <p className="text-xs text-muted-foreground mb-3">{original_content.description}</p>
              )}
              {original_content.image_url && (
                <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={original_content.image_url}
                    alt={original_content.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          {sharedPost.shared_type === 'restaurant' && (
            <div className="p-3">
              <h4 className="font-medium text-sm mb-2">{original_content.name}</h4>
              {original_content.description && (
                <p className="text-xs text-muted-foreground mb-2">{original_content.description}</p>
              )}
              {original_content.location && (
                <p className="text-xs text-muted-foreground mb-3 flex items-center">
                  📍 {original_content.location}
                </p>
              )}
              {original_content.cover_image_url && (
                <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={original_content.cover_image_url}
                    alt={original_content.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}
        </div>
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
          <div className="mb-4">
            <p className="text-sm">{sharedPost.comment}</p>
          </div>
        )}

        {/* Original Content */}
        {renderOriginalContent()}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
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
          <div className="border-t bg-muted/30 animate-accordion-down mt-4 pt-4">
            <SimpleSharedPostComments sharedPostId={sharedPost.id} />
          </div>
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
