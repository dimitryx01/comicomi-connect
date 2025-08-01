import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

interface MainAppProviderProps {
  children: React.ReactNode;
}

export const MainAppProvider: React.FC<MainAppProviderProps> = ({ children }) => {
  console.log('[DEBUG] MainAppProvider: Initializing main app auth context');
  
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};