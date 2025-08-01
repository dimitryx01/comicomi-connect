
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
      
      // Primero obtenemos los bloqueos
      const { data: blocks, error: blocksError } = await supabase
        .from('user_blocks')
        .select('*')
        .eq('blocker_id', user.id);
      
      if (blocksError) throw blocksError;
      if (!blocks || blocks.length === 0) return [];
      
      // Luego obtenemos los datos de los usuarios bloqueados
      const blockedUserIds = blocks.map(block => block.blocked_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, username, avatar_url')
        .in('id', blockedUserIds);
      
      if (usersError) throw usersError;
      
      // Combinamos los datos
      return blocks.map(block => ({
        ...block,
        blocked_user: users?.find(user => user.id === block.blocked_id) || null
      }));
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
      queryClient.invalidateQueries({ queryKey: ['user-blocks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['is-blocked'] });
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
      queryClient.invalidateQueries({ queryKey: ['user-blocks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['is-blocked'] });
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

// Hook para obtener múltiples estados de bloqueo de una vez
export const useMultipleBlockStatus = (userIds: string[]) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['multiple_block_status', user?.id, userIds],
    queryFn: async () => {
      if (!user?.id || userIds.length === 0) return {};

      const { data, error } = await supabase
        .from('user_blocks')
        .select('blocker_id, blocked_id')
        .or(`and(blocker_id.eq.${user.id},blocked_id.in.(${userIds.join(',')})),and(blocker_id.in.(${userIds.join(',')}),blocked_id.eq.${user.id})`);

      if (error) throw error;

      // Crear un mapa de estados de bloqueo
      const blockStatus: Record<string, { iBlockedThem: boolean; theyBlockedMe: boolean; isBlocked: boolean }> = {};
      
      userIds.forEach(userId => {
        const iBlockedThem = data?.some(block => block.blocker_id === user.id && block.blocked_id === userId) || false;
        const theyBlockedMe = data?.some(block => block.blocker_id === userId && block.blocked_id === user.id) || false;
        
        blockStatus[userId] = {
          iBlockedThem,
          theyBlockedMe,
          isBlocked: iBlockedThem || theyBlockedMe
        };
      });

      return blockStatus;
    },
    enabled: !!user?.id && userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para verificar si existe bloqueo bidireccional entre dos usuarios
export const useIsBlocked = (otherUserId: string | null) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-blocked', user?.id, otherUserId],
    queryFn: async () => {
      if (!user?.id || !otherUserId) return { isBlocked: false, iBlockedThem: false, theyBlockedMe: false };
      
      const { data, error } = await supabase
        .from('user_blocks')
        .select('blocker_id, blocked_id')
        .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`);
      
      if (error) throw error;
      
      const iBlockedThem = data.some(block => block.blocker_id === user.id && block.blocked_id === otherUserId);
      const theyBlockedMe = data.some(block => block.blocker_id === otherUserId && block.blocked_id === user.id);
      
      return {
        isBlocked: iBlockedThem || theyBlockedMe,
        iBlockedThem,
        theyBlockedMe
      };
    },
    enabled: !!user?.id && !!otherUserId,
  });
};
