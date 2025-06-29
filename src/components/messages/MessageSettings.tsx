
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, UserX, MessageCircle } from 'lucide-react';
import { useMessagePreferences, useUpdateMessagePreferences } from '@/hooks/useMessagePreferences';
import { useUserBlocks, useUnblockUser } from '@/hooks/useUserBlocks';

export const MessageSettings = () => {
  const { data: preferences } = useMessagePreferences();
  const { data: blockedUsers = [] } = useUserBlocks();
  const updatePreferences = useUpdateMessagePreferences();
  const unblockUser = useUnblockUser();

  const handleToggleMessages = async (allowMessages: boolean) => {
    await updatePreferences.mutateAsync({ allowMessages });
  };

  const handleUnblockUser = async (userId: string) => {
    await unblockUser.mutateAsync({ blockedUserId: userId });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Mensajes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allow-messages">Permitir mensajes</Label>
              <p className="text-sm text-muted-foreground">
                Permite que otros usuarios te envíen mensajes privados
              </p>
            </div>
            <Switch
              id="allow-messages"
              checked={preferences?.allow_messages ?? true}
              onCheckedChange={handleToggleMessages}
              disabled={updatePreferences.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Usuarios Bloqueados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No has bloqueado a ningún usuario
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((block: any) => (
                <div key={block.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={block.blocked_user?.avatar_url || ''} />
                      <AvatarFallback>
                        {(block.blocked_user?.full_name || block.blocked_user?.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {block.blocked_user?.full_name || block.blocked_user?.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{block.blocked_user?.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockUser(block.blocked_id)}
                    disabled={unblockUser.isPending}
                  >
                    Desbloquear
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
