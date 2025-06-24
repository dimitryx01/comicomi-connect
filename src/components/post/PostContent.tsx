
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { OriginalContentImage } from '@/components/post/OriginalContentImage';

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

  if (type === 'image') {
    console.log('🖼️ PostContent: Usando OriginalContentImage:', {
      fileId: fileId.substring(0, 50) + '...',
      source
    });
    
    return (
      <AspectRatio ratio={4/3} className="bg-muted">
        <OriginalContentImage
          fileId={fileId}
          alt={`Imagen del post - ${source}`}
          className="object-cover w-full h-full rounded-lg"
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

  console.log('📄 PostContent renderizando:', {
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

      {/* New Media System */}
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
                
                console.log('🔄 PostContent: Procesando imagen:', {
                  imageId: imageId.substring(0, 50) + '...',
                  index
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
                    source="new-media-system"
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legacy Media Support */}
      {hasLegacyMedia && (
        <div className="relative w-full px-3 sm:px-4 pb-3">
          {imageUrl && (() => {
            console.log('🔄 PostContent: Procesando imagen legacy:', {
              imageUrl: imageUrl.substring(0, 50) + '...'
            });
            return (
              <AspectRatio ratio={4/3} className="bg-muted">
                <OriginalContentImage
                  fileId={imageUrl}
                  alt="Post - Legacy"
                  className="object-cover w-full h-full rounded-lg"
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
