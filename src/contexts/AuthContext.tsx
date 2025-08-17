
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
  const prevAccessTokenRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

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
        console.log('[DEBUG] AuthProvider: Auth state change', { event, hasSession: !!session });
        
        const accessToken = session?.access_token ?? null;
        const userId = session?.user?.id ?? null;
        
        // Ignorar eventos redundantes que no cambian la sesión real
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
            prevAccessTokenRef.current === accessToken &&
            prevUserIdRef.current === userId) {
          console.log('[DEBUG] AuthProvider: Ignoring redundant auth event', { event });
          return;
        }
        
        // Validar que la sesión sea realmente válida
        const isValidSession = session && session.access_token && session.user;
        
        if (event === 'SIGNED_OUT' || !isValidSession) {
          console.log('[DEBUG] AuthProvider: Clearing auth state');
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
          setLoading(false);
          prevAccessTokenRef.current = null;
          prevUserIdRef.current = null;
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        setLoading(false);
        prevAccessTokenRef.current = accessToken;
        prevUserIdRef.current = userId;

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
              // Si hay error al obtener el perfil del usuario, posiblemente la sesión sea inválida
              console.log('[DEBUG] AuthProvider: Error fetching user profile, clearing session');
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
              setUserRole(null);
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
      prevAccessTokenRef.current = session?.access_token ?? null;
      prevUserIdRef.current = session?.user?.id ?? null;
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
      console.log('[DEBUG] AuthProvider: Starting logout process');
      
      // Limpiar localStorage manualmente
      localStorage.removeItem('sb-cufdemvvewfqkwrszotl-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Limpiar estado local inmediatamente
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      console.log('[DEBUG] AuthProvider: Logout completed');
      
      // Forzar redirección a la página principal
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Aunque falle el logout del servidor, limpiar estado local
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Limpiar localStorage de todos modos
      localStorage.clear();
      
      // Forzar redirección
      window.location.href = '/';
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
