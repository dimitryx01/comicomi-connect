
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SmartLazyImage } from '@/components/ui/SmartLazyImage';
import { FallbackImage } from '@/components/ui/FallbackImage';

interface PostContentProps {
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrls?: {
    images?: string[];
    videos?: string[];
  };
}

// TEMPORAL: Switch para diagnóstico - cambiar a true para usar fallback simple
const USE_FALLBACK_IMAGES = false;

// Función para determinar si es una URL pública o un fileId privado
const isPublicUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

const MediaItem = ({ 
  fileId, 
  type, 
  index = 0,
  source = 'unknown'
}: { 
  fileId: string; 
  type: 'image' | 'video';
  index?: number;
  source?: string;
}) => {
  // Prioridad basada en posición: primeras imágenes tienen mayor prioridad
  const priority = index === 0 ? 'high' : index < 3 ? 'medium' : 'low';
  
  console.log('🎬 DIAGNOSTIC - MediaItem renderizando:', {
    fileId: fileId.substring(0, 50) + '...',
    type,
    index,
    priority,
    source,
    isPublic: isPublicUrl(fileId),
    useFallback: USE_FALLBACK_IMAGES,
    timestamp: new Date().toISOString()
  });

  if (type === 'image') {
    return (
      <AspectRatio ratio={4/3} className="bg-muted">
        {USE_FALLBACK_IMAGES ? (
          <FallbackImage
            src={fileId}
            alt={`Imagen del post - ${source} (Fallback)`}
            className="object-cover w-full h-full rounded-lg"
            priority={priority}
          />
        ) : (
          <SmartLazyImage
            src={fileId}
            alt={`Imagen del post - ${source}`}
            className="object-cover w-full h-full rounded-lg"
            priority={priority}
            enableCancellation={false} // Deshabilitado para diagnóstico
            maxRetries={3}
            onLoad={() => {
              console.log('✅ DIAGNOSTIC - MediaItem imagen cargada:', {
                fileId: fileId.substring(0, 50) + '...',
                source,
                index
              });
            }}
            onError={() => {
              console.error('❌ DIAGNOSTIC - MediaItem error cargando imagen:', {
                fileId: fileId.substring(0, 50) + '...',
                source,
                index
              });
            }}
          />
        )}
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
          console.error('❌ DIAGNOSTIC - MediaItem error cargando video:', {
            fileId: fileId.substring(0, 50) + '...',
            source,
            error: e
          });
        }}
        onLoadStart={() => {
          console.log('📹 DIAGNOSTIC - MediaItem iniciando carga de video:', {
            fileId: fileId.substring(0, 50) + '...',
            source
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

  console.log('📄 DIAGNOSTIC - PostContent renderizando:', {
    hasContent: !!content,
    hasNewMedia,
    hasLegacyMedia,
    newMediaImages: mediaUrls?.images?.length || 0,
    newMediaVideos: mediaUrls?.videos?.length || 0,
    legacyImage: !!imageUrl,
    legacyVideo: !!videoUrl,
    useFallback: USE_FALLBACK_IMAGES,
    timestamp: new Date().toISOString()
  });

  return (
    <>
      {/* Post Content */}
      {content && (
        <div className="px-3 sm:px-4 pb-3">
          <p className="text-sm whitespace-pre-line break-words">{content}</p>
        </div>
      )}

      {/* Indicador de modo diagnóstico */}
      {import.meta.env.DEV && USE_FALLBACK_IMAGES && (
        <div className="px-3 sm:px-4 pb-2">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded text-sm">
            🔧 MODO DIAGNÓSTICO: Usando carga de imágenes sin optimizaciones
          </div>
        </div>
      )}

      {/* New Media System - Sistema unificado para TODAS las publicaciones */}
      {hasNewMedia && (
        <div className="px-3 sm:px-4 pb-3 space-y-3">
          {/* Imágenes con sistema unificado */}
          {mediaUrls.images && mediaUrls.images.length > 0 && (
            <div className="space-y-3">
              {mediaUrls.images.map((imageId, index) => {
                if (!imageId || imageId.trim() === '') {
                  console.warn('⚠️ DIAGNOSTIC - PostContent: ImageId vacío encontrado:', { index });
                  return null;
                }
                
                console.log('🖼️ DIAGNOSTIC - PostContent procesando imagen:', {
                  imageId: imageId.substring(0, 50) + '...',
                  index,
                  isPublic: isPublicUrl(imageId)
                });
                
                return (
                  <MediaItem 
                    key={`image-${index}-${imageId}`} 
                    fileId={imageId} 
                    type="image" 
                    index={index}
                    source="new-media-system"
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
                  console.warn('⚠️ DIAGNOSTIC - PostContent: VideoId vacío encontrado:', { index });
                  return null;
                }
                
                return (
                  <MediaItem 
                    key={`video-${index}-${videoId}`} 
                    fileId={videoId} 
                    type="video" 
                    index={index}
                    source="new-media-system"
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legacy Media Support - USANDO EL MISMO FLUJO UNIFICADO */}
      {hasLegacyMedia && (
        <div className="relative w-full px-3 sm:px-4 pb-3">
          {imageUrl && (
            <div>
              {import.meta.env.DEV && (
                <div className="mb-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  🔍 DIAGNOSTIC: Legacy Image System {USE_FALLBACK_IMAGES ? '(Fallback Mode)' : '(Smart Mode)'}
                </div>
              )}
              <AspectRatio ratio={4/3} className="bg-muted">
                {USE_FALLBACK_IMAGES ? (
                  <FallbackImage
                    src={imageUrl}
                    alt="Post - Legacy (Fallback)"
                    className="object-cover w-full h-full rounded-lg"
                    priority="medium"
                  />
                ) : (
                  <SmartLazyImage
                    src={imageUrl}
                    alt="Post - Legacy"
                    className="object-cover w-full h-full rounded-lg"
                    priority="medium"
                    enableCancellation={false} // Deshabilitado para diagnóstico
                    maxRetries={3}
                    onLoad={() => {
                      console.log('✅ DIAGNOSTIC - Legacy imagen cargada:', imageUrl.substring(0, 50) + '...');
                    }}
                    onError={() => {
                      console.error('❌ DIAGNOSTIC - Legacy error cargando imagen:', imageUrl.substring(0, 50) + '...');
                    }}
                  />
                )}
              </AspectRatio>
            </div>
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
                  console.error('❌ DIAGNOSTIC - Legacy error cargando video:', {
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
