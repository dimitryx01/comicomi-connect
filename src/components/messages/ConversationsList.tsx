
import { useState } from 'react';
import { MessageCircle, Search, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useConversations } from '@/hooks/useMessages';
import { useBlockUser } from '@/hooks/useUserBlocks';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationsListProps {
  onSelectConversation: (partnerId: string, partnerName: string) => void;
  selectedConversationId?: string;
}

export const ConversationsList = ({ onSelectConversation, selectedConversationId }: ConversationsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: conversations = [], isLoading } = useConversations();
  const blockUser = useBlockUser();

  const filteredConversations = conversations.filter(conv =>
    conv.conversation_partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.conversation_partner_username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUser = async (userId: string) => {
    await blockUser.mutateAsync({ blockedUserId: userId });
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
    <Card className="h-full">
      <CardHeader>
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
      <CardContent className="p-0">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground px-4">
            {searchTerm ? 'No se encontraron conversaciones' : 'No tienes conversaciones aún'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.conversation_partner_id}
                className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 ${
                  selectedConversationId === conversation.conversation_partner_id ? 'bg-muted' : ''
                }`}
                onClick={() => onSelectConversation(
                  conversation.conversation_partner_id,
                  conversation.conversation_partner_name || conversation.conversation_partner_username
                )}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.conversation_partner_avatar || ''} />
                  <AvatarFallback>
                    {(conversation.conversation_partner_name || conversation.conversation_partner_username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">
                      {conversation.conversation_partner_name || conversation.conversation_partner_username}
                    </h4>
                    <div className="flex items-center gap-2">
                      {conversation.unread_count > 0 && (
                        <Badge variant="default" className="text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.last_message_time), { 
                          addSuffix: true,
                          locale: es 
                        })}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockUser(conversation.conversation_partner_id);
                            }}
                            className="text-red-600"
                          >
                            Bloquear usuario
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.is_sender && 'Tú: '}{conversation.last_message_text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
