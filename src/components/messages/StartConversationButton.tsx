
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useSendMessage } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface StartConversationButtonProps {
  userId: string;
  userName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const StartConversationButton = ({
  userId,
  userName,
  variant = 'outline',
  size = 'sm',
  className
}: StartConversationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const sendMessage = useSendMessage();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user || user.id === userId) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({
        receiverId: userId,
        text: message
      });
      
      setMessage('');
      setIsOpen(false);
      
      toast({
        title: "Mensaje enviado",
        description: `Tu mensaje ha sido enviado a ${userName}`
      });
      
      // Navigate to messages page
      navigate('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Mensaje
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar mensaje a {userName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || sendMessage.isPending}
            >
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
