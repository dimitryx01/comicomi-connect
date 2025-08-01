
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const userId = user?.id;

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 useUserProfile: Fetching user profile for:', userId);

      // Obtener datos del usuario con timeout
      const userQuery = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: userData, error: userError } = await Promise.race([
        userQuery,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);

      if (userError) {
        console.error('❌ useUserProfile: Error fetching user data:', userError);
        throw userError;
      }

      if (!userData) {
        console.log('ℹ️ useUserProfile: No user data found, profile might not exist yet');
        setProfile(null);
        return;
      }

      console.log('✅ useUserProfile: User data loaded, fetching interests...');

      // Obtener intereses del usuario con timeout y manejo de errores
      try {
        const interestsQuery = supabase
          .from('user_interests')
          .select(`
            interest_id,
            interests (
              id,
              name,
              category_id
            )
          `)
          .eq('user_id', userId);

        const { data: userInterests, error: interestsError } = await Promise.race([
          interestsQuery,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Interests timeout')), 5000)
          )
        ]);

        if (interestsError) {
          console.warn('⚠️ useUserProfile: Error fetching interests (continuando sin intereses):', interestsError);
        }

        const interests = (userInterests || [])
          .map(ui => ui.interests)
          .filter(Boolean);

        const userProfile: UserProfile = {
          ...userData,
          interests: interests as any[]
        };

        console.log('✅ useUserProfile: Profile loaded successfully:', {
          userId: userProfile.id,
          username: userProfile.username,
          interestsCount: interests.length
        });
        setProfile(userProfile);
      } catch (interestsError) {
        console.warn('⚠️ useUserProfile: Failed to load interests, using profile without interests:', interestsError);
        
        // Crear perfil sin intereses
        const userProfile: UserProfile = {
          ...userData,
          interests: []
        };
        setProfile(userProfile);
      }
    } catch (error: any) {
      console.error('❌ useUserProfile: Error fetching user profile:', {
        error,
        message: error?.message,
        userId
      });
      
      let errorMessage = "No se pudo cargar el perfil del usuario";
      
      if (error?.message === 'Timeout') {
        errorMessage = "La carga del perfil está tardando más de lo esperado. Intenta recargar la página.";
      } else if (error?.code === '42501') {
        errorMessage = "Error de permisos al cargar el perfil.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return false;

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
        .eq('id', userId);

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
    if (!userId) return false;

    try {
      setLoading(true);
      console.log('Updating user interests:', selectedInterestIds);

      // Eliminar intereses existentes
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insertar nuevos intereses
      if (selectedInterestIds.length > 0) {
        const interestInserts = selectedInterestIds.map(interestId => ({
          user_id: userId,
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
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return {
    profile,
    loading,
    updateProfile,
    updateInterests,
    refetchProfile: fetchProfile
  };
};
