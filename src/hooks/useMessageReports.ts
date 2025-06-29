
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useReportMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      messageId,
      reason,
      description
    }: {
      messageId: string;
      reason: string;
      description?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('message_reports')
        .insert({
          reporter_id: user.id,
          message_id: messageId,
          reason,
          description
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Mensaje reportado",
        description: "El mensaje ha sido reportado y será revisado por nuestro equipo"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo reportar el mensaje",
        variant: "destructive"
      });
    }
  });
};
