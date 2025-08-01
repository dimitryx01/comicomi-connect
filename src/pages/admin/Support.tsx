import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Search, User, Mail, Activity, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const passwordResetSchema = z.object({
  new_password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirm_password: z.string().min(6, 'Confirma la contraseña'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
});

type PasswordResetForm = z.infer<typeof passwordResetSchema>;

interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  created_at: string;
  last_login?: string;
  is_verified: boolean;
  onboarding_completed: boolean;
}

const Support: React.FC = () => {
  const { hasAnyRole } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'name' | 'id'>('email');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  // Search users query
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['user-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      let query = supabase.from('users').select('*');
      
      switch (searchType) {
        case 'email':
          query = query.ilike('email', `%${searchTerm}%`);
          break;
        case 'name':
          query = query.or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
          break;
        case 'id':
          query = query.eq('id', searchTerm);
          break;
      }
      
      const { data, error } = await query.limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  // Password reset mutation
  const passwordResetMutation = useMutation({
    mutationFn: async (data: PasswordResetForm & { userId: string }) => {
      // In a real application, this would be handled by Supabase Auth
      // For now, we'll show a success message
      toast.success('En una implementación real, se enviaría un email de restablecimiento');
      return true;
    },
    onSuccess: () => {
      setPasswordResetOpen(false);
      setSelectedUser(null);
      form.reset();
      toast.success('Solicitud de restablecimiento enviada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al restablecer contraseña');
    },
  });

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const openPasswordReset = (user: User) => {
    setSelectedUser(user);
    setPasswordResetOpen(true);
  };

  const handlePasswordReset = (data: PasswordResetForm) => {
    if (selectedUser) {
      passwordResetMutation.mutate({ ...data, userId: selectedUser.id });
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_verified) {
      return <Badge variant="destructive">No Verificado</Badge>;
    }
    if (!user.onboarding_completed) {
      return <Badge variant="secondary">Onboarding Pendiente</Badge>;
    }
    return <Badge variant="default">Activo</Badge>;
  };

  // Mock activity data - in real app this would come from audit logs
  const mockActivity = [
    { action: 'Inicio de sesión', timestamp: '2024-01-15 10:30:00', ip: '192.168.1.1' },
    { action: 'Actualización de perfil', timestamp: '2024-01-14 15:22:00', ip: '192.168.1.1' },
    { action: 'Publicación creada', timestamp: '2024-01-14 14:15:00', ip: '192.168.1.1' },
  ];

  if (!hasAnyRole(['admin_master', 'soporte_tecnico'])) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              Solo los Admin Master y Soporte Técnico pueden acceder a este módulo.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Soporte Técnico</h1>
        <p className="text-muted-foreground">
          Herramientas de soporte y gestión de usuarios
        </p>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Búsqueda de Usuarios</TabsTrigger>
          <TabsTrigger value="tools">Herramientas</TabsTrigger>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Usuarios</CardTitle>
              <CardDescription>
                Busca usuarios por email, nombre o ID para obtener información detallada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder={`Buscar por ${searchType === 'email' ? 'email' : searchType === 'name' ? 'nombre' : 'ID'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={searchType === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSearchType('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant={searchType === 'name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSearchType('name')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Nombre
                  </Button>
                  <Button
                    variant={searchType === 'id' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSearchType('id')}
                  >
                    ID
                  </Button>
                </div>
              </div>

              {isSearching && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openUserDetails(user)}
                            >
                              Ver Detalles
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPasswordReset(user)}
                            >
                              Reset Password
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios con ese criterio de búsqueda
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Diagnósticos del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Verificar conectividad de base de datos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Comprobar estado de servicios
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Analizar logs de errores
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Herramientas de Limpieza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Limpiar archivos temporales
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Optimizar base de datos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Regenerar índices
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente del Sistema</CardTitle>
              <CardDescription>
                Últimas acciones y eventos importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.timestamp} - IP: {activity.ip}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información completa del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">ID:</label>
                <p className="text-sm text-muted-foreground font-mono">{selectedUser.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Nombre Completo:</label>
                <p className="text-sm text-muted-foreground">{selectedUser.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Username:</label>
                <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email:</label>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Estado de Verificación:</label>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.is_verified ? 'Verificado' : 'No verificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Onboarding:</label>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.onboarding_completed ? 'Completado' : 'Pendiente'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Fecha de Registro:</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </p>
              </div>
              {selectedUser.last_login && (
                <div>
                  <label className="text-sm font-medium">Último Acceso:</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.last_login).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordResetOpen} onOpenChange={setPasswordResetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restablecer Contraseña</DialogTitle>
            <DialogDescription>
              Restablecer la contraseña del usuario {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-4">
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setPasswordResetOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={passwordResetMutation.isPending}>
                  {passwordResetMutation.isPending ? 'Restableciendo...' : 'Restablecer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;