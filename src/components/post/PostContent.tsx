
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LazyImage } from '@/components/ui/LazyImage';
import { useUnifiedSignedUrl } from '@/hooks/useUnifiedSignedUrl';

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
  
  const { data: signedUrl, isLoading, error } = useUnifiedSignedUrl(fileId, {
    enabled: !isPublicUrl(fileId),
    type: 'media',
    priority
  });

  // Para URLs públicas, usar directamente; para fileIds privados, usar signedUrl
  const finalUrl = isPublicUrl(fileId) ? fileId : signedUrl;

  if (isLoading && !isPublicUrl(fileId)) {
    return (
      <div className="w-full h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  if (error || (!finalUrl && !isPublicUrl(fileId))) {
    return (
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Error cargando {type}</span>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <AspectRatio ratio={4/3} className="bg-muted">
        <LazyImage
          src={finalUrl || fileId}
          alt="Imagen del post"
          className="object-cover w-full h-full rounded-lg"
        />
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={16/9} className="bg-muted">
      <video 
        src={finalUrl || fileId}
        controls 
        className="w-full h-full object-cover rounded-lg"
        preload="metadata"
      />
    </AspectRatio>
  );
};

export const PostContent = ({ content, imageUrl, videoUrl, mediaUrls }: PostContentProps) => {
  // Lógica simplificada: priorizar el nuevo sistema mediaUrls, luego legacy
  const hasNewMedia = mediaUrls && ((mediaUrls.images && mediaUrls.images.length > 0) || (mediaUrls.videos && mediaUrls.videos.length > 0));
  const hasLegacyMedia = !hasNewMedia && (imageUrl || videoUrl);

  return (
    <>
      {/* Post Content */}
      {content && (
        <div className="px-3 sm:px-4 pb-3">
          <p className="text-sm whitespace-pre-line break-words">{content}</p>
        </div>
      )}

      {/* New Media System - Prioridad */}
      {hasNewMedia && (
        <div className="px-3 sm:px-4 pb-3 space-y-3">
          {/* Imágenes */}
          {mediaUrls.images && mediaUrls.images.length > 0 && (
            <div className="space-y-3">
              {mediaUrls.images.map((imageId, index) => (
                <MediaItem 
                  key={`image-${index}`} 
                  fileId={imageId} 
                  type="image" 
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Videos */}
          {mediaUrls.videos && mediaUrls.videos.length > 0 && (
            <div className="space-y-3">
              {mediaUrls.videos.map((videoId, index) => (
                <MediaItem 
                  key={`video-${index}`} 
                  fileId={videoId} 
                  type="video" 
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legacy Media Support - Solo si no hay nuevo sistema */}
      {hasLegacyMedia && (
        <div className="relative w-full px-3 sm:px-4 pb-3">
          {imageUrl && (
            <AspectRatio ratio={4/3} className="bg-muted">
              <LazyImage
                src={imageUrl}
                alt="Post"
                className="object-cover w-full h-full rounded-lg"
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
              />
            </AspectRatio>
          )}
        </div>
      )}
    </>
  );
};
