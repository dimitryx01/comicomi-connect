
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SmartLazyImage } from '@/components/ui/SmartLazyImage';

interface PostContentProps {
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrls?: {
    images?: string[];
    videos?: string[];
  };
}

// Función para determinar si es una URL pública o un fileId privado
const isPublicUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

const MediaItem = ({ 
  fileId, 
  type, 
  index = 0 
}: { 
  fileId: string; 
  type: 'image' | 'video';
  index?: number;
}) => {
  // Prioridad basada en posición: primeras imágenes tienen mayor prioridad
  const priority = index === 0 ? 'high' : index < 3 ? 'medium' : 'low';
  
  console.log('🎬 MediaItem: Renderizando con flujo unificado:', {
    fileId: fileId.substring(0, 50) + '...',
    type,
    index,
    priority,
    isPublic: isPublicUrl(fileId)
  });

  if (type === 'image') {
    return (
      <AspectRatio ratio={4/3} className="bg-muted">
        <SmartLazyImage
          src={fileId}
          alt="Imagen del post"
          className="object-cover w-full h-full rounded-lg"
          priority={priority}
          enableCancellation={false} // Deshabilitado para mayor estabilidad
          maxRetries={3} // Permitir más reintentos
        />
      </AspectRatio>
    );
  }

  // Para videos, usar el componente nativo con mejores fallbacks
  return (
    <AspectRatio ratio={16/9} className="bg-muted">
      <video 
        src={fileId}
        controls 
        className="w-full h-full object-cover rounded-lg"
        preload="metadata"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('❌ MediaItem: Error cargando video:', {
            fileId: fileId.substring(0, 50) + '...',
            error: e
          });
        }}
        onLoadStart={() => {
          console.log('📹 MediaItem: Iniciando carga de video:', {
            fileId: fileId.substring(0, 50) + '...'
          });
        }}
      />
    </AspectRatio>
  );
};

export const PostContent = ({ content, imageUrl, videoUrl, mediaUrls }: PostContentProps) => {
  // Lógica unificada: priorizar el nuevo sistema mediaUrls, luego legacy
  const hasNewMedia = mediaUrls && ((mediaUrls.images && mediaUrls.images.length > 0) || (mediaUrls.videos && mediaUrls.videos.length > 0));
  const hasLegacyMedia = !hasNewMedia && (imageUrl || videoUrl);

  console.log('📄 PostContent: Renderizando contenido:', {
    hasContent: !!content,
    hasNewMedia,
    hasLegacyMedia,
    newMediaImages: mediaUrls?.images?.length || 0,
    newMediaVideos: mediaUrls?.videos?.length || 0,
    legacyImage: !!imageUrl,
    legacyVideo: !!videoUrl
  });

  return (
    <>
      {/* Post Content */}
      {content && (
        <div className="px-3 sm:px-4 pb-3">
          <p className="text-sm whitespace-pre-line break-words">{content}</p>
        </div>
      )}

      {/* New Media System - Flujo unificado y robusto */}
      {hasNewMedia && (
        <div className="px-3 sm:px-4 pb-3 space-y-3">
          {/* Imágenes con SmartLazyImage mejorado */}
          {mediaUrls.images && mediaUrls.images.length > 0 && (
            <div className="space-y-3">
              {mediaUrls.images.map((imageId, index) => {
                if (!imageId || imageId.trim() === '') {
                  console.warn('⚠️ PostContent: ImageId vacío encontrado:', { index });
                  return null;
                }
                
                return (
                  <MediaItem 
                    key={`image-${index}-${imageId}`} 
                    fileId={imageId} 
                    type="image" 
                    index={index}
                  />
                );
              })}
            </div>
          )}

          {/* Videos con manejo robusto */}
          {mediaUrls.videos && mediaUrls.videos.length > 0 && (
            <div className="space-y-3">
              {mediaUrls.videos.map((videoId, index) => {
                if (!videoId || videoId.trim() === '') {
                  console.warn('⚠️ PostContent: VideoId vacío encontrado:', { index });
                  return null;
                }
                
                return (
                  <MediaItem 
                    key={`video-${index}-${videoId}`} 
                    fileId={videoId} 
                    type="video" 
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legacy Media Support - Con flujo mejorado */}
      {hasLegacyMedia && (
        <div className="relative w-full px-3 sm:px-4 pb-3">
          {imageUrl && (
            <AspectRatio ratio={4/3} className="bg-muted">
              <SmartLazyImage
                src={imageUrl}
                alt="Post"
                className="object-cover w-full h-full rounded-lg"
                priority="medium"
                enableCancellation={false}
                maxRetries={3}
              />
            </AspectRatio>
          )}
          
          {videoUrl && (
            <AspectRatio ratio={16/9} className="bg-muted">
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-cover rounded-lg"
                preload="metadata"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('❌ PostContent: Error cargando video legacy:', {
                    videoUrl: videoUrl.substring(0, 50) + '...',
                    error: e
                  });
                }}
              />
            </AspectRatio>
          )}
        </div>
      )}
    </>
  );
};
