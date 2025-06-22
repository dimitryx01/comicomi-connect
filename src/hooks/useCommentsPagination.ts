
import { useState, useCallback, useMemo } from 'react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar_url: string;
  cheers_count: number;
}

interface UseCommentsPaginationProps {
  comments: Comment[];
  initialPageSize?: number;
  pageSize?: number;
}

export const useCommentsPagination = ({
  comments,
  initialPageSize = 5,
  pageSize = 5
}: UseCommentsPaginationProps) => {
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  console.log('📄 useCommentsPagination:', {
    totalComments: comments.length,
    visibleCount,
    initialPageSize,
    pageSize
  });

  // Ordenar comentarios cronológicamente (más antiguos primero, más recientes al final)
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB; // Ascendente: más antiguos primero
    });
  }, [comments]);

  // Comentarios visibles (mostrar los últimos N comentarios)
  const visibleComments = useMemo(() => {
    if (sortedComments.length <= visibleCount) {
      return sortedComments;
    }
    // Mostrar los últimos comentarios hasta el límite visible
    return sortedComments.slice(-visibleCount);
  }, [sortedComments, visibleCount]);

  // Calcular si hay más comentarios para mostrar
  const hasMore = useMemo(() => {
    return sortedComments.length > visibleCount;
  }, [sortedComments.length, visibleCount]);

  // Número de comentarios ocultos
  const hiddenCount = useMemo(() => {
    return Math.max(0, sortedComments.length - visibleCount);
  }, [sortedComments.length, visibleCount]);

  const loadMore = useCallback(() => {
    console.log('📄 useCommentsPagination: Cargando más comentarios...');
    setVisibleCount(prev => Math.min(prev + pageSize, sortedComments.length));
  }, [pageSize, sortedComments.length]);

  const reset = useCallback(() => {
    console.log('📄 useCommentsPagination: Reiniciando paginación...');
    setVisibleCount(initialPageSize);
  }, [initialPageSize]);

  return {
    visibleComments,
    hasMore,
    hiddenCount,
    loadMore,
    reset,
    totalCount: sortedComments.length,
    visibleCount
  };
};
