import React from 'react';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

interface AdminAppProviderProps {
  children: React.ReactNode;
}

export const AdminAppProvider: React.FC<AdminAppProviderProps> = ({ children }) => {
  console.log('[DEBUG] AdminAppProvider: Initializing admin auth context');
  
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
};