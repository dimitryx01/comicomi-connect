
import { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useDebounce } from '@/hooks/useAuthDebounce';

interface UserRole {
  role: 'user' | 'moderator' | 'admin' | null;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  userRole: UserRole['role'];
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  session: null,
  userRole: null,
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole['role']>(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const initializingRef = useRef(false);

  console.log('[DEBUG] AuthProvider: Current state', { 
    isAuthenticated, 
    hasUser: !!user, 
    loading 
  });

  const debouncedStateUpdate = useDebounce(() => {
    console.log('[DEBUG] Debounced auth state update completed');
  }, 100);

  useEffect(() => {
    // Prevent multiple initializations in development
    if (initializingRef.current) {
      console.log('[DEBUG] AuthProvider: Already initializing, skipping');
      return;
    }
    
    initializingRef.current = true;
    console.log('[DEBUG] AuthProvider: Initializing auth state');
    
    // Clean up any existing subscription
    if (subscriptionRef.current) {
      console.log('[DEBUG] Cleaning up existing subscription');
      subscriptionRef.current.unsubscribe();
    }
    
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[DEBUG] Auth state change:', event, !!session);
        
        // Debounce rapid state changes in development
        debouncedStateUpdate();
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setLoading(false);

        // Defer any additional data fetching to prevent blocking
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!userData) {
                console.log('[DEBUG] No user profile found, creating one');
                await supabase
                  .from('users')
                  .insert([{
                    id: session.user.id,
                    email: session.user.email,
                    onboarding_completed: false
                  }]);
              } else {
                setUserRole('user');
              }
            } catch (error) {
              console.error('[DEBUG] Error handling user profile:', error);
            }
          }, 100); // Slightly longer delay for development
        } else {
          setUserRole(null);
        }
      }
    );

    subscriptionRef.current = subscription;

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[DEBUG] Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);
      initializingRef.current = false;
    });

    return () => {
      console.log('[DEBUG] AuthProvider: Cleaning up subscription');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [debouncedStateUpdate]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        session,
        userRole,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
