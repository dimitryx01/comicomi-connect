
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          // Check user profile and onboarding status
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
                  // Onboarding completado
                  if (location.pathname === '/onboarding') {
                    // Si está en onboarding pero ya lo completó, ir al feed
                    navigate('/feed');
                  } else if (isOnAuthPage) {
                    // Si está en login/register pero ya está autenticado, ir al feed
                    navigate('/feed');
                  }
                  // Si está en cualquier otra página, quedarse ahí
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
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
