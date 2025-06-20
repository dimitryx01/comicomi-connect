
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink, MessageCircle, Clock, MapPin, Users, ChefHat } from 'lucide-react';
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
            <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Contenido no disponible</p>
            <p className="text-xs">El contenido original puede haber sido eliminado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(created_at), {
    addSuffix: true,
    locale: es
  });

  const getContentTypeInfo = () => {
    switch (shared_type) {
      case 'post': 
        return { 
          text: 'post', 
          icon: MessageCircle, 
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20' 
        };
      case 'recipe': 
        return { 
          text: 'receta', 
          icon: ChefHat, 
          color: 'bg-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950/20' 
        };
      case 'restaurant': 
        return { 
          text: 'restaurante', 
          icon: MapPin, 
          color: 'bg-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20' 
        };
      default: 
        return { 
          text: 'contenido', 
          icon: Share2, 
          color: 'bg-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20' 
        };
    }
  };

  const getOriginalAuthor = () => {
    if (shared_type === 'post' || shared_type === 'recipe') {
      return original_content.users || {};
    }
    return null;
  };

  const getOriginalImage = () => {
    if (shared_type === 'post') {
      return original_content.media_urls?.images?.[0] || original_content.image_url;
    } else if (shared_type === 'recipe') {
      return original_content.image_url;
    } else if (shared_type === 'restaurant') {
      return original_content.image_url || original_content.cover_image_url;
    }
    return null;
  };

  const contentInfo = getContentTypeInfo();
  const originalAuthor = getOriginalAuthor();
  const originalImage = getOriginalImage();
  const IconComponent = contentInfo.icon;

  const handleViewOriginal = () => {
    // Aquí podrías implementar la navegación al contenido original
    console.log('🔗 Navegando al contenido original:', { shared_type, original_content });
  };

  const handleAuthorClick = () => {
    if (originalAuthor) {
      console.log('👤 Navegando al perfil del autor:', originalAuthor);
      // Aquí implementarías la navegación al perfil del autor
    }
  };

  return (
    <Card className={`border-none shadow-lg overflow-hidden mb-4 w-full ${contentInfo.bgColor} border-l-4 border-l-blue-500`}>
      <CardContent className="p-0">
        {/* Header de la publicación compartida */}
        <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200 dark:ring-blue-800">
                <AvatarImage src={sharer.avatar_url} alt={sharer.full_name} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {sharer.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {sharer.full_name}
                  </p>
                  <Badge className={`text-xs text-white ${contentInfo.color} hover:opacity-80 transition-opacity`}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    Compartió un {contentInfo.text}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{sharer.username}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {timeAgo}
            </div>
          </div>
          
          {/* Comentario del usuario que compartió */}
          {comment && (
            <div className="mt-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{comment}</p>
            </div>
          )}
        </div>

        {/* Contenido original con diseño mejorado */}
        <div className="relative bg-white dark:bg-gray-900 mx-3 mb-3 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-md transition-shadow duration-200">
          {/* Overlay sutil de identificación */}
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="secondary" className="text-xs bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50">
              <Share2 className="h-3 w-3 mr-1" />
              Original
            </Badge>
          </div>
          
          <div className="p-4">
            {/* Header del contenido original */}
            <div className="flex items-center justify-between mb-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors"
                onClick={handleAuthorClick}
              >
                {originalAuthor && (
                  <>
                    <Avatar className="h-8 w-8 ring-1 ring-gray-200 dark:ring-gray-700">
                      <AvatarImage src={originalAuthor.avatar_url} alt={originalAuthor.full_name} />
                      <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-800">
                        {originalAuthor.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {originalAuthor.full_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{originalAuthor.username}</p>
                    </div>
                  </>
                )}
                {shared_type === 'restaurant' && (
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {original_content.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Restaurante</p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewOriginal}
                className="text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver original
              </Button>
            </div>

            {/* Contenido específico según el tipo */}
            {shared_type === 'post' && (
              <div className="space-y-4">
                {original_content.content && (
                  <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                    {original_content.content}
                  </p>
                )}
                {original_content.location && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3 mr-1" />
                    {original_content.location}
                  </div>
                )}
                {originalImage && (
                  <div className="cursor-pointer hover:opacity-95 transition-opacity" onClick={handleViewOriginal}>
                    <LazyImage
                      src={originalImage}
                      alt="Imagen del post"
                      className="w-full h-64 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {shared_type === 'recipe' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer" onClick={handleViewOriginal}>
                    {original_content.title}
                  </h3>
                  {original_content.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {original_content.description}
                    </p>
                  )}
                </div>
                
                {originalImage && (
                  <div className="cursor-pointer hover:opacity-95 transition-opacity" onClick={handleViewOriginal}>
                    <LazyImage
                      src={originalImage}
                      alt={original_content.title}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  {original_content.prep_time && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Prep: {original_content.prep_time} min
                    </div>
                  )}
                  {original_content.cook_time && (
                    <div className="flex items-center">
                      <ChefHat className="h-3 w-3 mr-1" />
                      Cocina: {original_content.cook_time} min
                    </div>
                  )}
                  {original_content.servings && (
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {original_content.servings} porciones
                    </div>
                  )}
                </div>
              </div>
            )}

            {shared_type === 'restaurant' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer" onClick={handleViewOriginal}>
                    {original_content.name}
                  </h3>
                  {original_content.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                      {original_content.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-3 mb-3">
                    {original_content.cuisine_type && (
                      <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">
                        {original_content.cuisine_type}
                      </Badge>
                    )}
                  </div>
                  
                  {original_content.location && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      {original_content.location}
                    </div>
                  )}
                </div>
                
                {originalImage && (
                  <div className="cursor-pointer hover:opacity-95 transition-opacity" onClick={handleViewOriginal}>
                    <LazyImage
                      src={originalImage}
                      alt={original_content.name}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-0">
        {/* Acciones de la publicación compartida */}
        <div className="px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCheer}
                disabled={cheersLoading || !currentUser}
                className={`text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-200 ${
                  hasCheered ? 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20' : ''
                }`}
              >
                <CheersIcon 
                  className={`h-4 w-4 mr-2 transition-all duration-200 ${
                    hasCheered ? 'scale-110' : ''
                  }`} 
                  filled={hasCheered}
                />
                {cheersCount > 0 && <span className="text-sm font-medium">{cheersCount}</span>}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {commentsCount > 0 && <span className="text-sm font-medium">{commentsCount}</span>}
              </Button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
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
