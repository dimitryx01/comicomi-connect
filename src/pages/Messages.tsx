
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ConversationsList } from '@/components/messages/ConversationsList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { MessageSettings } from '@/components/messages/MessageSettings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);

  const handleSelectConversation = (partnerId: string, partnerName: string, partnerAvatar?: string) => {
    setSelectedConversation({
      id: partnerId,
      name: partnerName,
      avatar: partnerAvatar
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 md:pb-6 px-4 md:px-6 md:h-screen md:flex md:flex-col">
      <div className="flex items-center gap-2 md:flex-shrink-0">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Mensajes</h1>
      </div>

      <Tabs defaultValue="conversations" className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
        <TabsList className="grid w-full grid-cols-2 md:flex-shrink-0">
          <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations" className="mt-6 md:flex-1 md:min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)] md:h-full">
            <div className="lg:col-span-1">
              <ConversationsList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
              />
            </div>
            
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <ChatWindow
                  partnerId={selectedConversation.id}
                  partnerName={selectedConversation.name}
                  partnerAvatar={selectedConversation.avatar}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                  <div className="text-center space-y-2">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      Selecciona una conversación
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Elige una conversación de la lista para comenzar a chatear
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <MessageSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
