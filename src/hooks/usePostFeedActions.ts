
import { useCallback } from 'react';

export const usePostFeedActions = (
  posts: any[],
  setPosts: (posts: any[]) => void
) => {
  
  const removePostOptimistically = useCallback((postId: string) => {
    console.log('⚡ usePostFeedActions: Eliminando post del feed optimísticamente:', postId);
    
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.filter(post => post.id !== postId);
      console.log('📊 usePostFeedActions: Posts actualizados:', {
        antes: prevPosts.length,
        después: updatedPosts.length,
        eliminado: postId
      });
      return updatedPosts;
    });
  }, [setPosts]);

  return {
    removePostOptimistically
  };
};
