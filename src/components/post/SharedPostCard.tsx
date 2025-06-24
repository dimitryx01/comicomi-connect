
import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2, Repeat2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { SharedPost } from "@/types/sharedPost";
import { useCheers } from "@/hooks/useCheers";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { useSharedPosts } from "@/hooks/useSharedPosts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostShareMenu } from "./PostShareMenu";
import { PostContent } from "./PostContent";
import { PostComments } from "./PostComments";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AvatarWithSignedUrl } from "@/components/ui/AvatarWithSignedUrl";

interface SharedPostCardProps {
  sharedPost: SharedPost;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string) => void;
}

export const SharedPostCard = ({ 
  sharedPost, 
  onPostDeleted, 
  onPostUpdated 
}: SharedPostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState(sharedPost.comment || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const { updateSharedPost, deleteSharedPost } = useSharedPosts();

  const { comments, commentsCount, loading: commentsLoading, addComment } = useComments(
    sharedPost.id
  );
  
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useCheers(
    sharedPost.id, 
    true
  );

  console.log('🔍 SharedPostCard: Renderizando shared post:', {
    id: sharedPost.id,
    sharedType: sharedPost.shared_type,
    hasOriginalContent: !!sharedPost.original_content,
    sharerName: sharedPost.sharer?.full_name,
    sharerAvatar: sharedPost.sharer?.avatar_url
  });

  const handleUpdateComment = async () => {
    if (!user || user.id !== sharedPost.sharer_id) {
      toast({
        title: "Error",
        description: "No tienes permisos para editar esta publicación",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const success = await updateSharedPost(sharedPost.id, editComment);
      if (success) {
        setIsEditing(false);
        if (onPostUpdated) {
          onPostUpdated(sharedPost.id);
        }
      }
    } catch (error) {
      console.error('Error updating shared post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSharedPost = async () => {
    if (!user || user.id !== sharedPost.sharer_id) {
      toast({
        title: "Error",
        description: "No tienes permisos para eliminar esta publicación",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteSharedPost(sharedPost.id);
      if (success && onPostDeleted) {
        onPostDeleted(sharedPost.id);
      }
    } catch (error) {
      console.error('Error deleting shared post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getContentTypeText = () => {
    switch (sharedPost.shared_type) {
      case 'post': return 'post';
      case 'recipe': return 'receta';
      case 'restaurant': return 'restaurante';
      default: return 'contenido';
    }
  };

  // Renderizar cuando no hay contenido original disponible
  if (!sharedPost.original_content) {
    console.log('⚠️ SharedPostCard: Contenido original no disponible para:', sharedPost.id);
    
    return (
      <Card className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden mb-4 w-full">
        {/* Header con indicador visual de post compartido */}
        <CardHeader className="pb-3 bg-blue-50/50">
          <div className="flex items-center text-blue-600 text-sm font-medium mb-2">
            <Repeat2 className="h-4 w-4 mr-1" />
            Post compartido
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AvatarWithSignedUrl 
                fileId={sharedPost.sharer?.avatar_url}
                fallbackText={sharedPost.sharer?.full_name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-foreground">
                    {sharedPost.sharer?.full_name || 'Usuario'}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    compartió un {getContentTypeText()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(sharedPost.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
            </div>
            
            {user && user.id === sharedPost.sharer_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar comentario
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDeleteSharedPost}
                    disabled={isDeleting}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Comentario del usuario que compartió */}
          {sharedPost.comment && !isEditing && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">{sharedPost.comment}</p>
            </div>
          )}

          {/* Editor de comentario */}
          {isEditing && (
            <div className="mb-4 space-y-2">
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Edita tu comentario..."
                className="min-h-[80px]"
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleUpdateComment}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditComment(sharedPost.comment || '');
                  }}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Mensaje de contenido no disponible */}
          <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Share2 className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Contenido no disponible
                </h3>
                <div className="mt-1 text-sm text-orange-700">
                  <p>
                    El {getContentTypeText()} original puede haber sido eliminado o ya no está disponible.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones limitadas */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCheer}
                disabled={cheersLoading}
                className={`text-muted-foreground hover:text-foreground ${
                  hasCheered ? 'text-red-500 hover:text-red-600' : ''
                }`}
              >
                <Heart className={`h-4 w-4 mr-1 ${hasCheered ? 'fill-current' : ''}`} />
                {cheersCount > 0 ? cheersCount : 'Me gusta'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {commentsCount > 0 ? commentsCount : 'Comentar'}
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Comentarios */}
        {showComments && (
          <PostComments
            comments={comments}
            currentUser={user ? {
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
              username: user.user_metadata?.username || user.email?.split('@')[0] || 'usuario',
              avatar: user.user_metadata?.avatar_url
            } : null}
            commentsLoading={commentsLoading}
            onAddComment={addComment}
          />
        )}
      </Card>
    );
  }

  // Renderizar cuando hay contenido original disponible
  const originalContent = sharedPost.original_content;
  
  return (
    <Card className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden mb-4 w-full">
      {/* Header con indicador visual de post compartido */}
      <CardHeader className="pb-3 bg-blue-50/50">
        <div className="flex items-center text-blue-600 text-sm font-medium mb-2">
          <Repeat2 className="h-4 w-4 mr-1" />
          Post compartido
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AvatarWithSignedUrl 
              fileId={sharedPost.sharer?.avatar_url}
              fallbackText={sharedPost.sharer?.full_name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-foreground">
                  {sharedPost.sharer?.full_name || 'Usuario'}
                </p>
                <span className="text-xs text-muted-foreground">
                  compartió un {getContentTypeText()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(sharedPost.created_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </p>
            </div>
          </div>
          
          {user && user.id === sharedPost.sharer_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar comentario
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteSharedPost}
                  disabled={isDeleting}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Comentario del usuario que compartió */}
        {sharedPost.comment && !isEditing && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">{sharedPost.comment}</p>
          </div>
        )}

        {/* Editor de comentario */}
        {isEditing && (
          <div className="mb-4 space-y-2">
            <Textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Edita tu comentario..."
              className="min-h-[80px]"
            />
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={handleUpdateComment}
                disabled={isUpdating}
              >
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditComment(sharedPost.comment || '');
                }}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Contenido original con diseño claramente diferenciado */}
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-white relative">
          {/* Etiqueta de contenido original */}
          <div className="absolute -top-3 left-4 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium">
            Contenido original
          </div>
          
          {/* Header del contenido original */}
          <div className="flex items-start space-x-3 mb-3 mt-2">
            <AvatarWithSignedUrl 
              fileId={originalContent.author?.avatar_url}
              fallbackText={originalContent.author?.full_name}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium">
                {originalContent.author?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-muted-foreground">
                {originalContent.author?.username && `@${originalContent.author.username}`}
              </p>
            </div>
          </div>

          {/* Contenido según el tipo */}
          {sharedPost.shared_type === 'post' && (
            <PostContent
              content={originalContent.content || ''}
              mediaUrls={originalContent.media_urls}
            />
          )}
          
          {sharedPost.shared_type === 'recipe' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{originalContent.title}</h3>
              {originalContent.description && (
                <p className="text-sm text-muted-foreground mb-2">{originalContent.description}</p>
              )}
              {originalContent.image_url && (
                <img 
                  src={originalContent.image_url} 
                  alt={originalContent.title}
                  className="w-full rounded-lg"
                />
              )}
            </div>
          )}
          
          {sharedPost.shared_type === 'restaurant' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{originalContent.name}</h3>
              {originalContent.description && (
                <p className="text-sm text-muted-foreground mb-2">{originalContent.description}</p>
              )}
              {originalContent.cover_image_url && (
                <img 
                  src={originalContent.cover_image_url} 
                  alt={originalContent.name}
                  className="w-full rounded-lg"
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
              disabled={cheersLoading}
              className={`text-muted-foreground hover:text-foreground ${
                hasCheered ? 'text-red-500 hover:text-red-600' : ''
              }`}
            >
              <Heart className={`h-4 w-4 mr-1 ${hasCheered ? 'fill-current' : ''}`} />
              {cheersCount > 0 ? cheersCount : 'Me gusta'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {commentsCount > 0 ? commentsCount : 'Comentar'}
            </Button>

            <PostShareMenu
              postId={sharedPost.id}
              postContent={sharedPost.comment || `${getContentTypeText()} compartido`}
              authorName={sharedPost.sharer?.full_name || 'Usuario'}
              contentType={sharedPost.shared_type}
              contentTitle={
                sharedPost.shared_type === 'recipe' ? originalContent.title :
                sharedPost.shared_type === 'restaurant' ? originalContent.name :
                originalContent.content?.slice(0, 50)
              }
            />
          </div>
        </div>
      </CardContent>

      {/* Comentarios */}
      {showComments && (
        <PostComments
          comments={comments}
          currentUser={user ? {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'usuario',
            avatar: user.user_metadata?.avatar_url
          } : null}
          commentsLoading={commentsLoading}
          onAddComment={addComment}
        />
      )}
    </Card>
  );
};
