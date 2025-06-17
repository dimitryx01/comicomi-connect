
import { useState, useCallback } from 'react';

export const usePostsPagination = (postsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  const calculatePagination = useCallback((totalPostsCount: number, page: number) => {
    const offset = (page - 1) * postsPerPage;
    const hasMorePosts = totalPostsCount ? offset + postsPerPage < totalPostsCount : false;
    
    setTotalCount(totalPostsCount);
    setHasMore(hasMorePosts);

    console.log('📄 usePostsPagination: Calculaciones de paginación:', {
      offset,
      hasMore: hasMorePosts,
      totalPages: Math.ceil(totalPostsCount / postsPerPage)
    });

    return { offset, hasMore: hasMorePosts };
  }, [postsPerPage]);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  return {
    currentPage,
    totalCount,
    hasMore,
    resetPagination,
    calculatePagination,
    goToNextPage,
    setCurrentPage
  };
};
