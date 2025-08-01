
import { createContext, useState, useContext, useEffect, ReactNode, useRef, useCallback } from 'react';
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

  const debouncedStateUpdate = useCallback(() => {
    // Stabilized callback to prevent infinite loops
  }, []);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializingRef.current) {
      return;
    }
    
    initializingRef.current = true;
    
    // Clean up any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setLoading(false);

        // Handle user profile
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!userData) {
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
              console.error('Error handling user profile:', error);
            }
          }, 100);
        } else {
          setUserRole(null);
        }
      }
    );

    subscriptionRef.current = subscription;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);
      initializingRef.current = false;
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      initializingRef.current = false;
    };
  }, []);

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
