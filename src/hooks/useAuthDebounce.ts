import { useRef, useCallback } from 'react';

interface DebounceHook {
  (callback: () => void, delay: number): () => void;
}

export const useDebounce: DebounceHook = (callback, delay) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);
};