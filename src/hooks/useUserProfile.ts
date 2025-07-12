
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  bio: string;
  city: string;
  country: string;
  location: string;
  avatar_url?: string; // Ahora contiene el fileId, no la URL pública
  cooking_level: string;
  dietary_restrictions: string[];
  favorite_cuisines: string[];
  onboarding_completed: boolean;
  created_at: string;
  interests: Array<{
    id: string;
    name: string;
    category_id: string;
  }>;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // ← CAMBIO: Inicializar como true
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      console.log('👤 useUserProfile: No user found in AuthContext, cannot fetch profile');
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('👤 useUserProfile: Fetching user profile for:', user.id);
      console.log('👤 useUserProfile: User email:', user.email);

      // Verificar la sesión actual
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('👤 useUserProfile: Current session:', sessionData.session ? 'Valid' : 'Invalid');

      // Obtener datos del usuario
      console.log('👤 useUserProfile: Executing Supabase query...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('👤 useUserProfile: Raw userData:', userData);
      console.log('👤 useUserProfile: User error:', userError);

      if (userError) {
        console.error('👤 useUserProfile: Error fetching user data:', userError);
        throw userError;
      }

      if (!userData) {
        console.log('👤 useUserProfile: No user data found, profile might not exist yet');
        setProfile(null);
        return;
      }

      console.log('👤 useUserProfile: Onboarding status (raw):', userData.onboarding_completed);
      console.log('👤 useUserProfile: Onboarding status (type):', typeof userData.onboarding_completed);
      console.log('👤 useUserProfile: Onboarding status (boolean check):', userData.onboarding_completed === true);

      // Obtener intereses del usuario
      const { data: userInterests, error: interestsError } = await supabase
        .from('user_interests')
        .select(`
          interest_id,
          interests (
            id,
            name,
            category_id
          )
        `)
        .eq('user_id', user.id);

      if (interestsError) throw interestsError;

      const interests = (userInterests || []).map(ui => ui.interests).filter(Boolean);

      const userProfile: UserProfile = {
        ...userData,
        interests: interests as any[]
      };

      console.log('👤 useUserProfile: User profile loaded:', userProfile);
      console.log('👤 useUserProfile: Final onboarding status:', userProfile.onboarding_completed);
      setProfile(userProfile);
    } catch (error) {
      console.error('👤 useUserProfile: Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil del usuario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    try {
      setLoading(true);
      console.log('Updating user profile:', updates);

      // Validar que avatar_url sea un fileId válido (no una URL base64 o HTTP)
      if (updates.avatar_url) {
        if (updates.avatar_url.startsWith('data:') || updates.avatar_url.startsWith('http')) {
          console.warn('Detectada URL inválida en avatar_url. Debe ser un fileId de Backblaze B2.');
          // No bloquear la actualización, pero mostrar advertencia
          toast({
            title: "Advertencia",
            description: "El avatar debe ser un archivo válido subido a nuestros servidores",
            variant: "destructive"
          });
          return false;
        }
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Perfil actualizado correctamente"
      });

      // Refrescar perfil después de actualizar
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateInterests = async (selectedInterestIds: string[]) => {
    if (!user) return false;

    try {
      setLoading(true);
      console.log('Updating user interests:', selectedInterestIds);

      // Eliminar intereses existentes
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Insertar nuevos intereses
      if (selectedInterestIds.length > 0) {
        const interestInserts = selectedInterestIds.map(interestId => ({
          user_id: user.id,
          interest_id: interestId
        }));

        const { error: insertError } = await supabase
          .from('user_interests')
          .insert(interestInserts);

        if (insertError) throw insertError;
      }

      toast({
        title: "¡Éxito!",
        description: "Intereses actualizados correctamente"
      });

      // Refrescar perfil después de actualizar
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Error updating user interests:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los intereses",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    updateInterests,
    refetchProfile: fetchProfile
  };
};
