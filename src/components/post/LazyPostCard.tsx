
import { useState, useRef, useEffect } from 'react';
import PostCard, { PostProps } from './PostCard';
import { PostSkeleton } from './PostSkeleton';
import { useIntelligentPreload } from '@/hooks/useIntelligentPreload';

interface LazyPostCardProps extends PostProps {
  threshold?: number;
  enablePreload?: boolean;
  preloadPriority?: 'high' | 'medium' | 'low';
}

export const LazyPostCard = ({ 
  threshold = 0.1, 
  enablePreload = true,
  preloadPriority = 'medium',
  ...postProps 
}: LazyPostCardProps) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Preparar datos para precarga inteligente
  const { preloadSpecificMedia } = useIntelligentPreload([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasLoaded) {
          console.log('👁️ LazyPostCard: Post entrando en vista con cache unificado:', postProps.id);
          setIsInView(true);
          setHasLoaded(true);

          // Precargar medios de este post si está habilitado
          if (enablePreload && postProps.mediaUrls) {
            const mediaToPreload: string[] = [];
            
            if (postProps.mediaUrls.images) {
              mediaToPreload.push(...postProps.mediaUrls.images);
            }
            if (postProps.mediaUrls.videos) {
              mediaToPreload.push(...postProps.mediaUrls.videos);
            }

            if (mediaToPreload.length > 0) {
              console.log('🎯 LazyPostCard: Precargando medios del post:', {
                postId: postProps.id,
                mediaCount: mediaToPreload.length,
                priority: preloadPriority
              });

              preloadSpecificMedia(mediaToPreload, 'media', preloadPriority);
            }
          }

          observer.disconnect();
        }
      },
      { threshold }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
      console.log('🔍 LazyPostCard: Observer configurado con precarga para post:', postProps.id);
    }

    return () => {
      observer.disconnect();
      console.log('🛑 LazyPostCard: Observer desconectado para post:', postProps.id);
    };
  }, [threshold, hasLoaded, postProps.id, enablePreload, preloadPriority, postProps.mediaUrls, preloadSpecificMedia]);

  return (
    <div ref={cardRef}>
      {isInView ? (
        <PostCard {...postProps} />
      ) : (
        <PostSkeleton />
      )}
    </div>
  );
};
