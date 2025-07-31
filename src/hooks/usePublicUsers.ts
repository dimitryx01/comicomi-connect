import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PublicUser {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
}

export const usePublicUsers = () => {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, full_name, username, avatar_url')
        .not('username', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching public users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchPublicUsers
  };
};