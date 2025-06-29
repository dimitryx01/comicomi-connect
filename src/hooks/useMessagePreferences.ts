
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MessagePreferences {
  id: string;
  user_id: string;
  allow_messages: boolean;
  created_at: string;
  updated_at: string;
}

export const useMessagePreferences = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['message-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_message_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as MessagePreferences | null;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateMessagePreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ allowMessages }: { allowMessages: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_message_preferences')
        .upsert({
          user_id: user.id,
          allow_messages: allowMessages
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-preferences'] });
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias de mensajes se han guardado correctamente"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las preferencias",
        variant: "destructive"
      });
    }
  });
};
