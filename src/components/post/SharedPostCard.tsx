
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useComments } from '@/hooks/useComments';
import { useCheers } from '@/hooks/useCheers';
import { useAuth } from '@/contexts/AuthContext';
import { PostComments } from './PostComments';
import { CheersIcon } from './CheersIcon';
import { SharedPost } from '@/hooks/useSharedPosts';
import { LazyImage } from '@/components/ui/LazyImage';

interface SharedPostCardProps {
  sharedPost: SharedPost;
}

export const SharedPostCard = ({ sharedPost }: SharedPostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const { user: currentUser } = useAuth();
  
  // Usar el ID de la publicación compartida para comentarios y cheers
  const { comments, commentsCount, loading: commentsLoading, addComment } = useComments(sharedPost.id);
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useCheers(sharedPost.id);

  const { original_content, sharer, shared_type, comment, created_at } = sharedPost;

  if (!original_content) {
    return (
      <Card className="border-none shadow-sm overflow-hidden mb-4 w-full opacity-50">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <p>Contenido no disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
    locale: es
  });

  const getContentTypeText = () => {
    switch (shared_type) {
      case 'post': return 'post';
      case 'recipe': return 'receta';
      case 'restaurant': return 'restaurante';
      default: return 'contenido';
    }
  };

  const getOriginalAuthor = () => {
    if (shared_type === 'post' || shared_type === 'recipe') {
      return original_content.users || {};
    }
    return null;
  };

  const originalAuthor = getOriginalAuthor();

  const handleViewOriginal = () => {
    // Aquí podrías implementar la navegación al contenido original
    console.log('🔗 Navegando al contenido original:', { shared_type, original_content });
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden mb-4 w-full bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardContent className="p-0">
        {/* Header de la publicación compartida */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={sharer.avatar_url} alt={sharer.full_name} />
                <AvatarFallback>{sharer.full_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-sm">{sharer.full_name}</p>
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Share2 className="h-3 w-3 mr-1" />
                    Compartió un {getContentTypeText()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">@{sharer.username}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {timeAgo}
            </div>
          </div>
          
          {/* Comentario del usuario que compartió */}
          {comment && (
            <div className="mt-3 p-3 bg-background/50 rounded-lg">
              <p className="text-sm">{comment}</p>
            </div>
          )}
        </div>

        {/* Contenido original */}
        <div className="relative">
          {/* Overlay sutil para diferenciar */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5 pointer-events-none z-10" />
          
          <div className="p-4">
            {/* Header del contenido original */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {originalAuthor && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={originalAuthor.avatar_url} alt={originalAuthor.full_name} />
                      <AvatarFallback>{originalAuthor.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{originalAuthor.full_name}</p>
                      <p className="text-xs text-muted-foreground">@{originalAuthor.username}</p>
                    </div>
                  </>
                )}
                {shared_type === 'restaurant' && (
                  <div>
                    <p className="font-medium text-sm">{original_content.name}</p>
                    <p className="text-xs text-muted-foreground">Restaurante</p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewOriginal}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver original
              </Button>
            </div>

            {/* Contenido específico según el tipo */}
            {shared_type === 'post' && (
              <div className="space-y-3">
                {original_content.content && (
                  <p className="text-sm leading-relaxed">{original_content.content}</p>
                )}
                {original_content.media_urls?.images && original_content.media_urls.images.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {original_content.media_urls.images.slice(0, 1).map((imageId: string, index: number) => (
                      <LazyImage
                        key={index}
                        fileId={imageId}
                        alt="Imagen del post"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {shared_type === 'recipe' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{original_content.title}</h3>
                {original_content.description && (
                  <p className="text-sm text-muted-foreground">{original_content.description}</p>
                )}
                {original_content.image_url && (
                  <LazyImage
                    fileId={original_content.image_url}
                    alt={original_content.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {original_content.prep_time && (
                    <span>Prep: {original_content.prep_time} min</span>
                  )}
                  {original_content.cook_time && (
                    <span>Cocina: {original_content.cook_time} min</span>
                  )}
                  {original_content.servings && (
                    <span>Porciones: {original_content.servings}</span>
                  )}
                </div>
              </div>
            )}

            {shared_type === 'restaurant' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{original_content.name}</h3>
                {original_content.description && (
                  <p className="text-sm text-muted-foreground">{original_content.description}</p>
                )}
                {original_content.cuisine_type && (
                  <Badge variant="outline" className="text-xs">
                    {original_content.cuisine_type}
                  </Badge>
                )}
                {original_content.location && (
                  <p className="text-xs text-muted-foreground">{original_content.location}</p>
                )}
                {original_content.image_url && (
                  <LazyImage
                    fileId={original_content.image_url}
                    alt={original_content.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-0">
        {/* Acciones de la publicación compartida */}
        <div className="px-4 py-2 border-t border-border/50 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCheer}
                disabled={cheersLoading || !currentUser}
                className={`text-muted-foreground hover:text-foreground transition-colors ${
                  hasCheered ? 'text-orange-500 hover:text-orange-600' : ''
                }`}
              >
                <CheersIcon 
                  className={`h-4 w-4 mr-1 transition-all duration-200 ${
                    hasCheered ? 'text-orange-500 scale-110' : ''
                  }`} 
                  filled={hasCheered}
                />
                {cheersCount > 0 && <span className="text-sm">{cheersCount}</span>}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {commentsCount > 0 && <span className="text-sm">{commentsCount}</span>}
              </Button>
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {timeAgo}
            </div>
          </div>
        </div>
      </CardFooter>

      {/* Comments Section */}
      {showComments && (
        <PostComments
          comments={comments}
          currentUser={currentUser}
          commentsLoading={commentsLoading}
          onAddComment={addComment}
        />
      )}
    </Card>
  );
};
