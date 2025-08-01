
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session first
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (mounted) {
          console.log('🔐 AuthContext: Sesión inicial obtenida:', !!initialSession);
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setIsAuthenticated(!!initialSession);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('🔐 AuthContext: Auth state changed:', event, !!session?.user);
            setSession(session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session);
            
            if (session?.user && event === 'SIGNED_IN') {
              // Only handle redirects on actual sign-in events to prevent loops
              setTimeout(async () => {
                if (!mounted) return;
                
                try {
                  const { data: userData, error } = await supabase
                    .from('users')
                    .select('onboarding_completed, id')
                    .eq('id', session.user.id)
                    .maybeSingle();
                  
                  if (error) {
                    console.error('Error fetching user data:', error);
                    return;
                  }
                  
                  // Si no existe el usuario en la tabla, crearlo
                  if (!userData) {
                    console.log('Creating user profile for:', session.user.id);
                    const { error: createError } = await supabase
                      .from('users')
                      .insert({
                        id: session.user.id,
                        email: session.user.email,
                        onboarding_completed: false
                      });
                    
                    if (createError) {
                      console.error('Error creating user profile:', createError);
                    }
                    
                    // Redirigir a onboarding para nuevo usuario
                    if (location.pathname !== '/onboarding') {
                      navigate('/onboarding');
                    }
                  } else {
                    // Usuario existe, verificar onboarding y redirigir según corresponda
                    const authPages = ['/login', '/register'];
                    const isOnAuthPage = authPages.includes(location.pathname);
                    
                    if (!userData.onboarding_completed) {
                      // Onboarding no completado
                      if (location.pathname !== '/onboarding') {
                        navigate('/onboarding');
                      }
                    } else {
                      // Onboarding completado - solo redirigir desde páginas de auth
                      if (isOnAuthPage) {
                        navigate('/feed');
                      }
                      // No redirigir automáticamente desde otras páginas
                    }
                  }
                } catch (error) {
                  console.error('Error in user profile check:', error);
                }
              }, 100);
            } else {
              // Usuario no autenticado, limpiar estado
              setUserRole(null);
              
              // Si está en rutas protegidas, redirigir a login
              const protectedRoutes = ['/feed', '/onboarding', '/profile', '/saved', '/following'];
              if (protectedRoutes.includes(location.pathname)) {
                navigate('/login');
              }
            }
          }
        );

        // Cleanup subscription
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      cleanup?.then?.(cleanupFn => cleanupFn?.());
      mounted = false;
    };
  }, [navigate, location.pathname]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      setUserRole(null);
      navigate('/');
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
