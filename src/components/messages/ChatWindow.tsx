
import { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Flag, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConversationMessages, useSendMessage, useMarkMessagesAsRead } from '@/hooks/useMessages';
import { useBlockUser } from '@/hooks/useUserBlocks';
import { useReportMessage } from '@/hooks/useMessageReports';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatWindowProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
}

export const ChatWindow = ({ partnerId, partnerName, partnerAvatar }: ChatWindowProps) => {
  const [messageText, setMessageText] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { data: messages = [], isLoading } = useConversationMessages(partnerId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesAsRead();
  const blockUser = useBlockUser();
  const reportMessage = useReportMessage();

  useEffect(() => {
    if (messages.length > 0) {
      markAsRead.mutate({ partnerId });
    }
  }, [messages.length, partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessage.mutateAsync({
        receiverId: partnerId,
        text: messageText
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleBlockUser = async () => {
    await blockUser.mutateAsync({ blockedUserId: partnerId });
  };

  const handleReportMessage = async (messageId: string) => {
    setReportingMessageId(messageId);
    setReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportingMessageId || !reportReason) return;

    await reportMessage.mutateAsync({
      messageId: reportingMessageId,
      reason: reportReason,
      description: reportDescription
    });

    setReportDialogOpen(false);
    setReportReason('');
    setReportDescription('');
    setReportingMessageId(null);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Cargando mensajes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={partnerAvatar || ''} />
              <AvatarFallback>
                {partnerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">{partnerName}</CardTitle>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBlockUser} className="text-red-600">
                <UserX className="w-4 h-4 mr-2" />
                Bloquear usuario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay mensajes aún. ¡Envía el primero!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className="group relative max-w-[70%]">
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span
                        className={`text-xs ${
                          message.sender_id === user?.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                      {message.sender_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          onClick={() => handleReportMessage(message.id)}
                        >
                          <Flag className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1"
              disabled={sendMessage.isPending}
            />
            <Button 
              type="submit" 
              disabled={!messageText.trim() || sendMessage.isPending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar mensaje</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Motivo del reporte</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Acoso</SelectItem>
                  <SelectItem value="inappropriate">Contenido inapropiado</SelectItem>
                  <SelectItem value="fake">Información falsa</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe el problema..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitReport} disabled={!reportReason}>
                Enviar reporte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
