
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
      if (!user?.id) {
        console.log('💌 useConversations: No user ID');
        return [];
      }
      
      console.log('💌 useConversations: Fetching conversations for user:', user.id);
      
      try {
        const { data, error } = await supabase.rpc('get_user_conversations', {
          user_uuid: user.id
        });
        
        if (error) {
          console.error('❌ useConversations: Error fetching conversations:', error);
          console.error('❌ useConversations: Error details:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        console.log('✅ useConversations: Conversations fetched successfully:', data?.length || 0);
        return data as Conversation[];
      } catch (error) {
        console.error('❌ useConversations: Exception fetching conversations:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });
};

export const useConversationMessages = (partnerId: string | null) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversation-messages', user?.id, partnerId],
    queryFn: async () => {
      if (!user?.id || !partnerId) {
        console.log('💌 useConversationMessages: Missing user ID or partner ID');
        return [];
      }
      
      console.log('💌 useConversationMessages: Fetching messages between:', user.id, 'and', partnerId);
      
      try {
        const { data, error } = await supabase.rpc('get_conversation_messages', {
          user_uuid: user.id,
          partner_uuid: partnerId,
          page_limit: 50,
          page_offset: 0
        });
        
        if (error) {
          console.error('❌ useConversationMessages: Error fetching messages:', error);
          console.error('❌ useConversationMessages: Error details:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        console.log('✅ useConversationMessages: Messages fetched successfully:', data?.length || 0);
        return (data as Message[]).reverse(); // Reverse to show oldest first
      } catch (error) {
        console.error('❌ useConversationMessages: Exception fetching messages:', error);
        throw error;
      }
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
      if (!user?.id) {
        console.error('❌ useSendMessage: User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log('💌 useSendMessage: Sending message from', user.id, 'to', receiverId);
      console.log('💌 useSendMessage: Message text length:', text.length);
      
      try {
        // Check if user can send message
        console.log('🔍 useSendMessage: Checking if user can send message...');
        const { data: canSend, error: permissionError } = await supabase.rpc('can_send_message', {
          sender_uuid: user.id,
          receiver_uuid: receiverId
        });
        
        if (permissionError) {
          console.error('❌ useSendMessage: Permission check error:', permissionError);
          console.error('❌ useSendMessage: Permission error details:', JSON.stringify(permissionError, null, 2));
          throw permissionError;
        }
        
        if (!canSend) {
          console.error('❌ useSendMessage: Cannot send message to this user');
          throw new Error('Cannot send message to this user');
        }
        
        console.log('✅ useSendMessage: Permission check passed, sending message...');
        
        const insertData = {
          sender_id: user.id,
          receiver_id: receiverId,
          text: text.trim()
        };
        
        console.log('💌 useSendMessage: Insert data:', insertData);
        
        const { data, error } = await supabase
          .from('messages')
          .insert(insertData)
          .select()
          .single();
        
        if (error) {
          console.error('❌ useSendMessage: Error inserting message:', error);
          console.error('❌ useSendMessage: Error details completos:', {
            error: error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            insertData
          });
          throw error;
        }
        
        console.log('✅ useSendMessage: Message sent successfully:', data.id);
        return data;
      } catch (error) {
        console.error('❌ useSendMessage: Exception sending message:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('💌 useSendMessage: Invalidating queries after message sent');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
    onError: (error: any) => {
      console.error('❌ useSendMessage: Error in mutation:', error);
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
      if (!user?.id) {
        console.error('❌ useMarkMessagesAsRead: User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log('💌 useMarkMessagesAsRead: Marking messages as read from', partnerId, 'to', user.id);
      
      try {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('sender_id', partnerId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
        
        if (error) {
          console.error('❌ useMarkMessagesAsRead: Error marking as read:', error);
          console.error('❌ useMarkMessagesAsRead: Error details:', JSON.stringify(error, null, 2));
          throw error;
        }
        
        console.log('✅ useMarkMessagesAsRead: Messages marked as read successfully');
      } catch (error) {
        console.error('❌ useMarkMessagesAsRead: Exception marking as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('💌 useMarkMessagesAsRead: Invalidating queries after mark as read');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    }
  });
};
