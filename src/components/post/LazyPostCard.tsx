
import { useState, useRef, useEffect } from 'react';
import PostCard, { PostProps } from './PostCard';
import { PostSkeleton } from './PostSkeleton';

interface LazyPostCardProps extends PostProps {
  threshold?: number;
}

export const LazyPostCard = ({ threshold = 0.1, ...postProps }: LazyPostCardProps) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasLoaded) {
          console.log('👁️ LazyPostCard: Post entrando en vista:', postProps.id);
          setIsInView(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
      console.log('🔍 LazyPostCard: Observer configurado para post:', postProps.id);
    }

    return () => {
      observer.disconnect();
      console.log('🛑 LazyPostCard: Observer desconectado para post:', postProps.id);
    };
  }, [threshold, hasLoaded, postProps.id]);

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
