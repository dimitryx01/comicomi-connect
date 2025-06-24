
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { OriginalContentImage } from '@/components/post/OriginalContentImage';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface PostContentProps {
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrls?: {
    images?: string[];
    videos?: string[];
  };
}

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
  console.log('🎬 MediaItem renderizando:', {
    fileId: fileId.substring(0, 50) + '...',
    type,
    index,
    source
  });

  // Función para obtener URL firmada
  const { signedUrl: getSignedUrlFunction } = useSignedUrl(null);
  
  const fetchFunction = async () => {
    if (!getSignedUrlFunction) {
      throw new Error('Signed URL function not available');
    }
    
    // Aquí necesitamos llamar al servicio de signed URLs
    // Por ahora, retornamos el fileId directamente como fallback
    return fileId;
  };

  if (type === 'image') {
    console.log('🖼️ PostContent: Usando OriginalContentImage con cache universal:', {
      fileId: fileId.substring(0, 50) + '...',
      source
    });
    
    return (
      <AspectRatio ratio={4/3} className="bg-muted">
        <OriginalContentImage
          fileId={fileId}
          alt={`Imagen del post - ${source}`}
          className="object-cover w-full h-full rounded-lg"
          fetchFunction={fetchFunction}
        />
      </AspectRatio>
    );
  }

  // Para videos, usar el componente nativo
  return (
    <AspectRatio ratio={16/9} className="bg-muted">
      <video 
        src={fileId}
        controls 
        className="w-full h-full object-cover rounded-lg"
        preload="metadata"
      />
    </AspectRatio>
  );
};

export const PostContent = ({ content, imageUrl, videoUrl, mediaUrls }: PostContentProps) => {
  // Lógica unificada: priorizar el nuevo sistema mediaUrls, luego legacy
  const hasNewMedia = mediaUrls && ((mediaUrls.images && mediaUrls.images.length > 0) || (mediaUrls.videos && mediaUrls.videos.length > 0));
  const hasLegacyMedia = !hasNewMedia && (imageUrl || videoUrl);

  console.log('📄 PostContent renderizando con cache universal:', {
    hasContent: !!content,
    hasNewMedia,
    hasLegacyMedia,
    newMediaImages: mediaUrls?.images?.length || 0,
    newMediaVideos: mediaUrls?.videos?.length || 0,
    legacyImage: !!imageUrl,
    legacyVideo: !!videoUrl,
    componentUsed: 'OriginalContentImage con UniversalImageCache'
  });

  // Función para obtener URL firmada para legacy images
  const fetchLegacyFunction = async () => {
    // Para imágenes legacy, simplemente retornar la URL
    return imageUrl || '';
  };

  return (
    <>
      {/* Post Content */}
      {content && (
        <div className="px-3 sm:px-4 pb-3">
          <p className="text-sm whitespace-pre-line break-words">{content}</p>
        </div>
      )}

      {/* New Media System - Con cache universal */}
      {hasNewMedia && (
        <div className="px-3 sm:px-4 pb-3 space-y-3">
          {/* Imágenes */}
          {mediaUrls.images && mediaUrls.images.length > 0 && (
            <div className="space-y-3">
              {mediaUrls.images.map((imageId, index) => {
                if (!imageId || imageId.trim() === '') {
                  console.warn('⚠️ PostContent: ImageId vacío encontrado:', { index });
                  return null;
                }
                
                console.log('🔄 PostContent: Procesando imagen con cache universal:', {
                  imageId: imageId.substring(0, 50) + '...',
                  index
                });
                
                return (
                  <MediaItem 
                    key={`image-${index}-${imageId}`} 
                    fileId={imageId} 
                    type="image" 
                    index={index}
                    source="new-media-system-universal-cache"
                  />
                );
              })}
            </div>
          )}

          {/* Videos */}
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
                    source="new-media-system-universal-cache"
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legacy Media Support - Con cache universal */}
      {hasLegacyMedia && (
        <div className="relative w-full px-3 sm:px-4 pb-3">
          {imageUrl && (() => {
            console.log('🔄 PostContent: Procesando imagen legacy con cache universal:', {
              imageUrl: imageUrl.substring(0, 50) + '...'
            });
            return (
              <AspectRatio ratio={4/3} className="bg-muted">
                <OriginalContentImage
                  fileId={imageUrl}
                  alt="Post - Legacy"
                  className="object-cover w-full h-full rounded-lg"
                  fetchFunction={fetchLegacyFunction}
                />
              </AspectRatio>
            );
          })()}
          
          {videoUrl && (
            <AspectRatio ratio={16/9} className="bg-muted">
              <video 
                src={videoUrl} 
                controls 
                className="w-full h-full object-cover rounded-lg"
                preload="metadata"
              />
            </AspectRatio>
          )}
        </div>
      )}
    </>
  );
};
