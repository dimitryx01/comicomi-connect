
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  date_of_birth: string | null;
  phone: string | null;
  is_private: boolean;
  onboarding_completed: boolean;
  cooking_level: string | null;
  dietary_restrictions: string[] | null;
  favorite_cuisines: string[] | null;
  created_at: string;
  updated_at: string;
  interests: Array<{ id: string; name: string }> | null;
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
        .select(`
          *,
          interests:user_interests(
            interest_id,
            interests(id, name)
          )
        `)
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Transform interests data
      const transformedProfile = {
        ...userData,
        interests: userData.interests ? 
          userData.interests.map((ui: any) => ({
            id: ui.interests.id,
            name: ui.interests.name
          })) : null
      };

      console.log('User profile loaded:', transformedProfile);
      setProfile(transformedProfile);
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

      setProfile(prev => prev ? { ...prev, ...data } : data);
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

  const updateInterests = useCallback(async (interestIds: string[]) => {
    if (!userId) return false;

    try {
      setLoading(true);
      setError(null);

      // First, delete existing interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId);

      // Then, insert new interests
      if (interestIds.length > 0) {
        const { error: insertError } = await supabase
          .from('user_interests')
          .insert(
            interestIds.map(interestId => ({
              user_id: userId,
              interest_id: interestId
            }))
          );

        if (insertError) throw insertError;
      }

      // Refresh profile to get updated interests
      await fetchProfile();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error updating interests:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateInterests,
  };
};
