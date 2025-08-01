
import { useState, useMemo } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useConversations } from '@/hooks/useMessages';
import { useBlockUser, useUnblockUser, useMultipleBlockStatus } from '@/hooks/useUserBlocks';
import { ConversationItem } from './ConversationItem';

interface ConversationsListProps {
  onSelectConversation: (partnerId: string, partnerName: string) => void;
  selectedConversationId?: string;
}

export const ConversationsList = ({ onSelectConversation, selectedConversationId }: ConversationsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: conversations = [], isLoading } = useConversations();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  
  // Obtener todos los IDs de usuarios para verificar estados de bloqueo de una vez
  const userIds = useMemo(() => 
    conversations.map(conv => conv.conversation_partner_id).filter(Boolean), 
    [conversations]
  );
  const { data: blockStatuses = {} } = useMultipleBlockStatus(userIds);

  // Memoizar conversaciones filtradas para evitar re-renders
  const filteredConversations = useMemo(() => 
    conversations.filter(conv =>
      conv.conversation_partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.conversation_partner_username?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [conversations, searchTerm]
  );

  const handleBlockUser = async (userId: string) => {
    await blockUser.mutateAsync({ blockedUserId: userId });
  };

  const handleUnblockUser = async (userId: string) => {
    await unblockUser.mutateAsync({ blockedUserId: userId });
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Mensajes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Cargando conversaciones...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Mensajes
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-0">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-4">
              {searchTerm ? 'No se encontraron conversaciones' : 'No tienes conversaciones aún'}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredConversations.map((conversation) => {
                const blockStatus = blockStatuses[conversation.conversation_partner_id];
                
                return (
                  <ConversationItem
                    key={conversation.conversation_partner_id}
                    partnerId={conversation.conversation_partner_id}
                    partnerName={conversation.conversation_partner_name || conversation.conversation_partner_username}
                    partnerUsername={conversation.conversation_partner_username}
                    partnerAvatar={conversation.conversation_partner_avatar || ''}
                    lastMessageText={conversation.last_message_text}
                    lastMessageTime={conversation.last_message_time}
                    unreadCount={conversation.unread_count}
                    isSender={conversation.is_sender}
                    isSelected={selectedConversationId === conversation.conversation_partner_id}
                    isBlocked={blockStatus?.iBlockedThem || false}
                    onSelect={onSelectConversation}
                    onBlock={handleBlockUser}
                    onUnblock={handleUnblockUser}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};
