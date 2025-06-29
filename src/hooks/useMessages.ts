
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  sender_username?: string;
  sender_avatar?: string;
}

export interface Conversation {
  conversation_partner_id: string;
  conversation_partner_name: string;
  conversation_partner_username: string;
  conversation_partner_avatar: string;
  last_message_text: string;
  last_message_time: string;
  unread_count: number;
  is_sender: boolean;
}

export const useConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_user_conversations', {
        user_uuid: user.id
      });
      
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user?.id,
  });
};

export const useConversationMessages = (partnerId: string | null) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversation-messages', user?.id, partnerId],
    queryFn: async () => {
      if (!user?.id || !partnerId) return [];
      
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        user_uuid: user.id,
        partner_uuid: partnerId,
        page_limit: 50,
        page_offset: 0
      });
      
      if (error) throw error;
      return (data as Message[]).reverse(); // Reverse to show oldest first
    },
    enabled: !!user?.id && !!partnerId,
  });
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      receiverId,
      text
    }: {
      receiverId: string;
      text: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check if user can send message
      const { data: canSend, error: permissionError } = await supabase.rpc('can_send_message', {
        sender_uuid: user.id,
        receiver_uuid: receiverId
      });
      
      if (permissionError) throw permissionError;
      if (!canSend) throw new Error('Cannot send message to this user');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          text: text.trim()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar mensaje",
        description: error.message === 'Cannot send message to this user' 
          ? 'No puedes enviar mensajes a este usuario'
          : 'No se pudo enviar el mensaje',
        variant: "destructive"
      });
    }
  });
};

export const useMarkMessagesAsRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ partnerId }: { partnerId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    }
  });
};
