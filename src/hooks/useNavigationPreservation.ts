import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationState {
  scrollPosition: number;
  timestamp: number;
  filters?: Record<string, any>;
}

export const useNavigationPreservation = (
  key: string,
  filters?: Record<string, any>
) => {
  const location = useLocation();

  // Save current state when leaving the page
  useEffect(() => {
    const saveState = () => {
      const state: NavigationState = {
        scrollPosition: window.scrollY,
        timestamp: Date.now(),
        filters
      };
      
      sessionStorage.setItem(`nav_state_${key}`, JSON.stringify(state));
    };

    // Save state on route change or page unload
    const handleBeforeUnload = () => saveState();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      saveState();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [key, filters]);

  // Restore state when returning to the page
  const restoreState = () => {
    try {
      const savedState = sessionStorage.getItem(`nav_state_${key}`);
      if (!savedState) return null;

      const state: NavigationState = JSON.parse(savedState);
      
      // Check if state is not too old (30 minutes)
      const isRecent = Date.now() - state.timestamp < 30 * 60 * 1000;
      
      if (isRecent) {
        // Restore scroll position
        setTimeout(() => {
          window.scrollTo({ 
            top: state.scrollPosition, 
            behavior: 'instant' 
          });
        }, 100);
        
        return state;
      }
    } catch (error) {
      console.warn('Failed to restore navigation state:', error);
    }
    
    return null;
  };

  return { restoreState };
};