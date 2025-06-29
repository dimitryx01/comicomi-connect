
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export const useUserBlocks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-blocks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_blocks')
        .select(`
          *,
          blocked_user:users!user_blocks_blocked_id_fkey(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('blocker_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useBlockUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ blockedUserId }: { blockedUserId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: blockedUserId
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Usuario bloqueado",
        description: "El usuario ha sido bloqueado correctamente"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo bloquear al usuario",
        variant: "destructive"
      });
    }
  });
};

export const useUnblockUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ blockedUserId }: { blockedUserId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedUserId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Usuario desbloqueado",
        description: "El usuario ha sido desbloqueado correctamente"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo desbloquear al usuario",
        variant: "destructive"
      });
    }
  });
};
