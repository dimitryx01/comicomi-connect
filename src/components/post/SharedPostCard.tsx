import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink, MessageCircle, Clock, MapPin, Users, ChefHat, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSharedPostComments } from '@/hooks/useSharedPostComments';
import { useSharedPostCheers } from '@/hooks/useSharedPostCheers';
import { useSharedPosts } from '@/hooks/useSharedPosts';
import { useAuth } from '@/contexts/AuthContext';
import { SharedPostComments } from './SharedPostComments';
import { CheersIcon } from './CheersIcon';
import { PostOptionsMenu } from './PostOptionsMenu';
import { EditSharedPostDialog } from './EditSharedPostDialog';
import { SharedPost } from '@/types/sharedPost';
import { LazyImage } from '@/components/ui/LazyImage';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { useSignedUrlQuery } from '@/hooks/useSignedUrlQuery';

interface SharedPostCardProps {
  sharedPost: SharedPost;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string) => void;
}

// Component to handle image display with signed URLs
const OriginalContentImage = ({ imageUrl, alt }: { imageUrl: string; alt: string }) => {
  // Check if it's a public URL or needs signed URL
  const isPublicUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
  const { data: signedUrl, isLoading, error } = useSignedUrlQuery(imageUrl, {
    enabled: !isPublicUrl
  });

  const finalUrl = isPublicUrl ? imageUrl : signedUrl;

  console.log('🖼️ OriginalContentImage: Renderizando imagen:', {
    imageUrl,
    isPublicUrl,
    signedUrl,
    finalUrl,
    isLoading,
    error
  });

  if (isLoading && !isPublicUrl) {
    return (
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 text-sm">Cargando imagen...</span>
      </div>
    );
  }

  if (error || (!finalUrl && !isPublicUrl)) {
    console.error('❌ OriginalContentImage: Error cargando imagen:', { error, imageUrl });
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
        <span className="text-gray-500 dark:text-gray-400 text-sm">Error cargando imagen</span>
      </div>
    );
  }

  return (
    <LazyImage
      src={finalUrl || imageUrl}
      alt={alt}
      className="w-full h-64 object-cover rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50"
    />
  );
};

export const SharedPostCard = ({ sharedPost, onPostDeleted, onPostUpdated }: SharedPostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user: currentUser } = useAuth();
  
  // Use the hooks for shared posts
  const { comments, commentsCount, loading: commentsLoading, addComment, refreshComments } = useSharedPostComments(sharedPost.id);
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useSharedPostCheers(sharedPost.id);
  const { deleteSharedPost, loading: deleteLoading } = useSharedPosts();

  const { original_content, sharer, shared_type, comment, created_at } = sharedPost;

  // CRITICAL: Obtener correctamente los IDs para verificar permisos
  const currentUserId = currentUser?.id;
  const sharerId = sharer?.id || sharedPost.sharer_id;
  const isOwner = currentUserId && sharerId && String(currentUserId) === String(sharerId);

  // Check if original content is available
  const isOriginalContentAvailable = !!(original_content && 
    (original_content.id || original_content.title || original_content.name || original_content.content));

  console.log('🔐 SharedPostCard: ANÁLISIS DETALLADO DE PERMISOS:', {
    sharedPostId: sharedPost.id,
    currentUserId,
    sharerId,
    sharerFromObject: sharer?.id,
    sharerFromField: sharedPost.sharer_id,
    isOwner,
    currentUserExists: !!currentUser,
    sharerExists: !!sharer,
    stringComparison: String(currentUserId) === String(sharerId),
    typeOfCurrentUserId: typeof currentUserId,
    typeOfSharerId: typeof sharerId,
    willShowEditDelete: isOwner,
    isOriginalContentAvailable
  });

  console.log('🎨 SharedPostCard: Renderizando publicación compartida:', {
    id: sharedPost.id,
    sharedType: shared_type,
    hasOriginalContent: !!original_content,
    isOriginalContentAvailable,
    sharerName: sharer?.full_name,
    sharerId,
    currentUserId,
    isOwner,
    cheersCount,
    commentsCount,
    hasCheered
  });

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
          bgColor: 'bg-blue-50/30 dark:bg-blue-950/10',
          borderColor: 'border-l-blue-500'
        };
      case 'recipe': 
        return { 
          text: 'receta', 
          icon: ChefHat, 
          color: 'bg-green-500',
          bgColor: 'bg-green-50/30 dark:bg-green-950/10',
          borderColor: 'border-l-green-500'
        };
      case 'restaurant': 
        return { 
          text: 'restaurante', 
          icon: MapPin, 
          color: 'bg-orange-500',
          bgColor: 'bg-orange-50/30 dark:bg-orange-950/10',
          borderColor: 'border-l-orange-500'
        };
      default: 
        return { 
          text: 'contenido', 
          icon: Share2, 
          color: 'bg-gray-500',
          bgColor: 'bg-gray-50/30 dark:bg-gray-950/10',
          borderColor: 'border-l-gray-500'
        };
    }
  };

  const getOriginalImage = () => {
    if (!isOriginalContentAvailable) return null;
    
    if (shared_type === 'post') {
      // For posts, check media_urls first, then fallback to legacy fields
      if (original_content.media_urls?.images?.length) {
        return original_content.media_urls.images[0];
      }
    } else if (shared_type === 'recipe') {
      return original_content.image_url;
    } else if (shared_type === 'restaurant') {
      return original_content.image_url || original_content.cover_image_url;
    }
    return null;
  };

  const contentInfo = getContentTypeInfo();
  const originalImage = getOriginalImage();
  const IconComponent = contentInfo.icon;

  console.log('🖼️ SharedPostCard: Información de imagen:', {
    shared_type,
    originalImage,
    media_urls: original_content?.media_urls,
    image_url: original_content?.image_url,
    isOriginalContentAvailable
  });

  const handleViewOriginal = () => {
    if (!isOriginalContentAvailable) return;
    console.log('🔗 Navegando al contenido original:', { shared_type, original_content });
    // Aquí se podría implementar la navegación al contenido original
  };

  const handleAuthorClick = () => {
    if (original_content?.author) {
      console.log('👤 Navegando al perfil del autor:', original_content.author);
      // Aquí se podría implementar la navegación al perfil del autor
    }
  };

  const handleEdit = () => {
    console.log('✏️ SharedPostCard: Iniciando edición de publicación compartida:', {
      sharedPostId: sharedPost.id,
      sharerId,
      currentUserId,
      isOwner
    });
    setShowEditDialog(true);
  };

  const handleDelete = async () => {
    console.log('🗑️ SharedPostCard: Iniciando eliminación de publicación compartida:', {
      sharedPostId: sharedPost.id,
      sharerId,
      currentUserId,
      isOwner
    });
    
    if (!isOwner) {
      console.error('❌ SharedPostCard: Usuario no autorizado para eliminar');
      return;
    }
    
    const success = await deleteSharedPost(sharedPost.id);
    if (success) {
      console.log('✅ SharedPostCard: Publicación compartida eliminada exitosamente');
      onPostDeleted?.(sharedPost.id);
    } else {
      console.error('❌ SharedPostCard: Error al eliminar publicación compartida');
    }
  };

  const handleSave = () => {
    console.log('💾 SharedPostCard: Guardando publicación compartida en favoritos:', sharedPost.id);
    // Implementar lógica de guardado
  };

  const handleReport = () => {
    console.log('🚩 SharedPostCard: Reportando publicación compartida:', sharedPost.id);
    // Implementar lógica de reporte
  };

  const handleEditSuccess = () => {
    console.log('✅ SharedPostCard: Publicación compartida editada exitosamente');
    onPostUpdated?.(sharedPost.id);
  };

  // Convertir currentUser para el formato esperado por SharedPostComments
  const formattedCurrentUser = currentUser ? {
    id: currentUser.id,
    name: (currentUser as any).user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Usuario',
    username: (currentUser as any).user_metadata?.username || currentUser.email?.split('@')[0] || 'usuario',
    avatar: (currentUser as any).user_metadata?.avatar_url
  } : null;

  // LOGS CRÍTICOS PARA VERIFICAR QUE EL AUTOR ID SE PASA CORRECTAMENTE
  console.log('📋 SharedPostCard: PREPARANDO PROPS CRÍTICAS PARA PostOptionsMenu:', {
    postId: sharedPost.id,
    authorId: sharerId,
    currentUserId,
    isOwner,
    willPassEditHandler: isOwner,
    willPassDeleteHandler: isOwner,
    editHandlerValue: isOwner ? 'HANDLER_DEFINED' : 'UNDEFINED',
    deleteHandlerValue: isOwner ? 'HANDLER_DEFINED' : 'UNDEFINED',
    saveHandlerValue: 'ALWAYS_DEFINED',
    reportHandlerValue: 'ALWAYS_DEFINED',
    originalContentAvailable: isOriginalContentAvailable
  });

  return (
    <>
      <Card className={`border-2 shadow-lg overflow-hidden mb-4 w-full ${contentInfo.bgColor} ${contentInfo.borderColor} transition-all duration-200 hover:shadow-xl`}>
        <CardContent className="p-0">
          {/* Header de la publicación compartida */}
          <div className="p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <AvatarWithSignedUrl 
                  fileId={sharer.avatar_url} 
                  fallbackText={sharer.full_name}
                  className="h-10 w-10 ring-2 ring-blue-200 dark:ring-blue-800"
                />
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
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeAgo}
                </div>
                {/* Menu de opciones - siempre disponible para el propietario */}
                <PostOptionsMenu
                  postId={sharedPost.id}
                  authorId={sharerId}
                  currentUserId={currentUserId}
                  onEdit={isOwner && isOriginalContentAvailable ? handleEdit : undefined}
                  onDelete={isOwner ? handleDelete : undefined}
                  onSave={handleSave}
                  onReport={handleReport}
                />
              </div>
            </div>
            
            {/* Comentario del usuario que compartió */}
            {comment && (
              <div className="mt-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{comment}</p>
              </div>
            )}
          </div>

          {/* Contenido original o mensaje de no disponible */}
          <div className="relative bg-white dark:bg-gray-900 mx-3 mb-3 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-lg transition-all duration-200">
            {!isOriginalContentAvailable ? (
              /* Mensaje de contenido no disponible */
              <div className="p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Contenido no disponible
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      El contenido original puede haber sido eliminado o ya no está disponible.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300">
                    <Share2 className="h-3 w-3 mr-1" />
                    {contentInfo.text} compartido
                  </Badge>
                </div>
              </div>
            ) : (
              /* Contenido original disponible */
              <>
                {/* Badge de contenido original */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="secondary" className="text-xs bg-white/95 dark:bg-gray-800/95 text-gray-600 dark:text-gray-300 border border-gray-300/50 dark:border-gray-600/50 shadow-sm">
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
                      {original_content.author && (
                        <>
                          <AvatarWithSignedUrl 
                            fileId={original_content.author.avatar_url} 
                            fallbackText={original_content.author.full_name}
                            className="h-8 w-8 ring-1 ring-gray-200 dark:ring-gray-700"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              {original_content.author.full_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">@{original_content.author.username}</p>
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

                  {/* Imagen del contenido original */}
                  {originalImage && (
                    <div className="mb-4 cursor-pointer hover:opacity-95 transition-opacity" onClick={handleViewOriginal}>
                      <OriginalContentImage
                        imageUrl={originalImage}
                        alt={`Imagen de ${shared_type === 'post' ? 'post' : shared_type === 'recipe' ? 'receta' : 'restaurante'}`}
                      />
                    </div>
                  )}

                  {/* ... keep existing code (content type specific rendering) */}
                  {shared_type === 'post' && (
                    <div className="space-y-3">
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
                    </div>
                  )}

                  {shared_type === 'recipe' && (
                    <div className="space-y-3">
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
                    <div className="space-y-3">
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
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3 w-3 mr-1" />
                            {original_content.location}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-0">
          {/* Acciones de la publicación compartida */}
          <div className="px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 w-full">
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
          <SharedPostComments
            comments={comments}
            currentUser={formattedCurrentUser}
            commentsLoading={commentsLoading}
            onAddComment={addComment}
            onRefreshComments={refreshComments}
          />
        )}
      </Card>

      {/* Edit Dialog - solo disponible si el contenido original existe */}
      {isOriginalContentAvailable && (
        <EditSharedPostDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          sharedPostId={sharedPost.id}
          currentComment={comment || ''}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};
