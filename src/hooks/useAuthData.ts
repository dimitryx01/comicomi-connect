
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hook temporal para simular datos de usuario autenticado
export const useAuthData = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Simular un usuario autenticado usando uno de los IDs de la base de datos
    const mockUser = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'maria.rodriguez@email.com',
      user_metadata: {
        full_name: 'María Rodríguez',
        username: 'chef_maria'
      }
    };

    const mockSession = {
      user: mockUser,
      access_token: 'mock-token'
    };

    setUser(mockUser);
    setSession(mockSession);
  }, []);

  return {
    user,
    session,
    loading: false
  };
};
