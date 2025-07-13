
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  date_of_birth: string | null;
  phone: string | null;
  is_private: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  interests: string[] | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize user ID to prevent unnecessary effect triggers
  const userId = useMemo(() => user?.id, [user?.id]);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      console.log('User profile loaded:', userData);
      setProfile(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error fetching user profile:', errorMessage);
      setError(errorMessage);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      console.log(`Fetching user profile for: ${userId}`);
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [userId, fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) return false;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error updating profile:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  };
};
