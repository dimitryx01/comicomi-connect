import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useAuthDebounce';
import { APP_CONFIG } from '@/config/app';

export type AdminRole = 'admin_master' | 'moderador_contenido' | 'gestor_establecimientos' | 'soporte_tecnico';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  roles: AdminRole[];
  last_login?: string;
  created_at: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  hasRole: (role: AdminRole) => boolean;
  hasAnyRole: (roles: AdminRole[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout>();
  
  // Session timeout (2 hours)
  const SESSION_TIMEOUT = 2 * 60 * 60 * 1000;
  
  // Debounced session validation to prevent excessive checks
  const debouncedSessionCheck = useDebounce(() => {
    const savedAdmin = localStorage.getItem(`${APP_CONFIG.storagePrefix}admin_user`);
    const sessionTimestamp = localStorage.getItem(`${APP_CONFIG.storagePrefix}admin_session_timestamp`);
    
    if (savedAdmin && sessionTimestamp) {
      const sessionAge = Date.now() - parseInt(sessionTimestamp);
      
      if (sessionAge > SESSION_TIMEOUT) {
        console.log('Admin session expired, logging out');
        logoutAdmin();
        return;
      }
      
      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        if (!adminUser || adminUser.id !== parsedAdmin.id) {
          setAdminUser(parsedAdmin);
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
        logoutAdmin();
      }
    } else if (adminUser) {
      setAdminUser(null);
    }
  }, 300);

  useEffect(() => {
    if (!isInitialized) {
      // Initial session check
      debouncedSessionCheck();
      setIsLoading(false);
      setIsInitialized(true);
      
      // Set up periodic session validation (every 5 minutes)
      sessionCheckIntervalRef.current = setInterval(() => {
        debouncedSessionCheck();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [isInitialized, debouncedSessionCheck]);
  
  // Update session timestamp on user activity
  useEffect(() => {
    if (adminUser) {
      const updateSessionTimestamp = () => {
        localStorage.setItem(`${APP_CONFIG.storagePrefix}admin_session_timestamp`, Date.now().toString());
      };
      
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      activityEvents.forEach(event => {
        document.addEventListener(event, updateSessionTimestamp, { passive: true });
      });
      
      return () => {
        activityEvents.forEach(event => {
          document.removeEventListener(event, updateSessionTimestamp);
        });
      };
    }
  }, [adminUser]);

  const loginAdmin = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Use supabase.functions.invoke instead of direct fetch for better error handling
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { email, password }
      });

      if (error) {
        console.error('Admin auth error:', error);
        return { success: false, error: error.message || 'Error de conexión' };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Credenciales inválidas' };
      }

      const adminUserData: AdminUser = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name,
        roles: data.user.roles || [],
        created_at: data.user.created_at,
      };

      setAdminUser(adminUserData);
      localStorage.setItem(`${APP_CONFIG.storagePrefix}admin_user`, JSON.stringify(adminUserData));
      localStorage.setItem(`${APP_CONFIG.storagePrefix}admin_session_timestamp`, Date.now().toString());

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error inesperado al conectar con el servidor' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminUser(null);
    localStorage.removeItem(`${APP_CONFIG.storagePrefix}admin_user`);
    localStorage.removeItem(`${APP_CONFIG.storagePrefix}admin_session_timestamp`);
    
    // Clear session check interval
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
    }
  }, []);

  const hasRole = useCallback((role: AdminRole): boolean => {
    return adminUser?.roles?.includes(role) || false;
  }, [adminUser?.roles]);

  const hasAnyRole = useCallback((roles: AdminRole[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  const value: AdminAuthContextType = {
    adminUser,
    isLoading,
    loginAdmin,
    logoutAdmin,
    hasRole,
    hasAnyRole,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};