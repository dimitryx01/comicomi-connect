import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useReportSharedPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      sharedPostId,
      reason = 'inappropriate_content',
      description = 'Post compartido reportado desde la interfaz'
    }: {
      sharedPostId: string;
      reason?: string;
      description?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          post_id: sharedPostId, // Using post_id field for shared posts too
          report_type: reason,
          description,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Reporte enviado",
        description: "Hemos recibido tu reporte y será revisado por nuestro equipo"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
    }
  });
};