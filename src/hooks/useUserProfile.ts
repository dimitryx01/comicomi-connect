
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
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
  created_at: string | null;
  updated_at: string | null;
  interests: Array<{ id: string; name: string }>;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user profile with interests
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select(`
          *,
          user_interests (
            interests (
              id,
              name
            )
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError(profileError.message);
        return;
      }

      if (userData) {
        console.log('📊 useUserProfile: Datos del perfil obtenidos:', userData);
        
        // Transform interests from the nested structure
        const interests = userData.user_interests?.map((ui: any) => ({
          id: ui.interests.id,
          name: ui.interests.name
        })) || [];

        const transformedProfile: UserProfile = {
          id: userData.id,
          full_name: userData.full_name || null,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          username: userData.username || null,
          bio: userData.bio || null,
          avatar_url: userData.avatar_url || null,
          website: null, // This field doesn't exist in the database yet
          location: userData.location || null,
          city: userData.city || null,
          country: userData.country || null,
          date_of_birth: null, // This field doesn't exist in the database yet
          phone: null, // This field doesn't exist in the database yet
          is_private: false, // This field doesn't exist in the database yet
          onboarding_completed: userData.onboarding_completed || false,
          cooking_level: userData.cooking_level || null,
          dietary_restrictions: userData.dietary_restrictions || null,
          favorite_cuisines: userData.favorite_cuisines || null,
          created_at: userData.created_at || null,
          updated_at: userData.updated_at || null,
          interests: interests
        };

        setProfile(transformedProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return false;

    try {
      setLoading(true);
      
      // Remove fields that don't exist in the database
      const { interests, website, date_of_birth, phone, is_private, ...dbUpdates } = updates;
      
      const { error: updateError } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error('Error al actualizar el perfil');
        return false;
      }

      // Update local state
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ...updates,
          // Ensure required fields don't become undefined and handle missing database fields
          website: prev.website, // Keep existing since it's not in database
          date_of_birth: prev.date_of_birth, // Keep existing since it's not in database
          phone: prev.phone, // Keep existing since it's not in database
          is_private: prev.is_private, // Keep existing since it's not in database
          onboarding_completed: updates.onboarding_completed ?? prev.onboarding_completed,
          interests: prev.interests // Keep existing interests as they're not updated here
        };
      });

      toast.success('Perfil actualizado correctamente');
      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      toast.error('Error al actualizar el perfil');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateInterests = async (interestIds: string[]) => {
    if (!user) return;

    try {
      setLoading(true);

      // First, delete existing interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      // Then, insert new interests if any
      if (interestIds.length > 0) {
        const interestInserts = interestIds.map(interestId => ({
          user_id: user.id,
          interest_id: interestId
        }));

        const { error: insertError } = await supabase
          .from('user_interests')
          .insert(interestInserts);

        if (insertError) {
          console.error('Error inserting interests:', insertError);
          toast.error('Error al actualizar los intereses');
          return;
        }
      }

      // Refetch profile to get updated interests
      await fetchProfile();
      
      toast.success('Intereses actualizados correctamente');
    } catch (error) {
      console.error('Error in updateInterests:', error);
      toast.error('Error al actualizar los intereses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateInterests
  };
};
