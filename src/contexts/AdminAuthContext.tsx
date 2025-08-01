import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    // Verificar si hay sesión admin guardada
    const savedAdmin = localStorage.getItem('comicomi_admin_user');
    if (savedAdmin) {
      try {
        setAdminUser(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.removeItem('comicomi_admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Llamar a la función edge para autenticación
      const response = await fetch('https://cufdemvvewfqkwrszotl.supabase.co/functions/v1/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZmRlbXZ2ZXdmcWt3cnN6b3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTM3NjEsImV4cCI6MjA2NTU2OTc2MX0.AWyyiiPCP8Y-RwnOvvVTw0kEbxdVsr8u_SH6TeF7m8I',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Credenciales inválidas' };
      }

      const adminUserData: AdminUser = {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.full_name,
        roles: result.user.roles || [],
        created_at: result.user.created_at,
      };

      setAdminUser(adminUserData);
      localStorage.setItem('comicomi_admin_user', JSON.stringify(adminUserData));

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error inesperado' };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('comicomi_admin_user');
  };

  const hasRole = (role: AdminRole): boolean => {
    return adminUser?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: AdminRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

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