import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { APP_CONFIG } from '@/config/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const createUserSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roles: z.array(z.string()).min(1, 'Debe asignar al menos un rol'),
});

const editUserSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  roles: z.array(z.string()).min(1, 'Debe asignar al menos un rol'),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

const availableRoles = [
  { value: 'moderador_contenido', label: 'Moderador de Contenido' },
  { value: 'gestor_establecimientos', label: 'Gestor de Establecimientos' },
  { value: 'soporte_tecnico', label: 'Soporte Técnico' },
  { value: 'admin_master', label: 'Admin Master' },
];

const AdminUsers: React.FC = () => {
  const { hasRole, adminUser } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      roles: [],
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: '',
      email: '',
      roles: [],
    },
  });

  // Fetch admin users from real database
  const { data: adminUsers = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('Fetching admin users...');
      const { data, error } = await (supabase as any).rpc('get_all_admin_users');
      
      if (error) {
        console.error('Error fetching admin users:', error);
        throw error;
      }
      
      console.log('Admin users fetched:', data);
      return data || [];
    },
    staleTime: 30000, // Cache for 30 seconds to prevent excessive requests
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create admin user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      if (!adminUser?.id) {
        throw new Error('No se encontró la información del administrador actual');
      }

      const { data, error } = await (supabase as any).rpc('create_admin_user', {
        user_full_name: userData.full_name,
        user_email: userData.email,
        user_password: userData.password,
        user_roles: userData.roles,
        assigned_by_id: adminUser.id
      });

      if (error) throw error;
      
      return data;
    },
    onSuccess: (newUserId: string) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setCreateDialogOpen(false);
      form.reset();
      toast.success('Usuario creado exitosamente');
      // Best-effort audit log
      if (adminUser?.id && newUserId) {
        (supabase as any).rpc('log_admin_action', {
          p_admin_user_id: adminUser.id,
          p_action: 'USER_CREATED',
          p_target_type: 'admin_user',
          p_target_id: newUserId,
          p_details: { email: form.getValues('email'), roles: form.getValues('roles') }
        }).catch((e: any) => console.warn('Audit log (create) failed', e));
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear usuario');
    },
  });

  // Edit admin user mutation
  const editUserMutation = useMutation({
    mutationFn: async (userData: EditUserForm & { id: string }) => {
      if (!adminUser?.id) {
        throw new Error('No se encontró la información del administrador actual');
      }

      console.log('Updating admin user:', userData);
      const { data, error } = await (supabase as any).rpc('update_admin_user', {
        user_id: userData.id,
        user_full_name: userData.full_name,
        user_email: userData.email,
        user_roles: userData.roles,
        updated_by_id: adminUser.id
      });
      
      if (error) {
        console.error('Error updating admin user:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditDialogOpen(false);
      // Best-effort audit log before clearing state
      if (adminUser?.id && variables?.id) {
        (supabase as any).rpc('log_admin_action', {
          p_admin_user_id: adminUser.id,
          p_action: 'USER_UPDATED',
          p_target_type: 'admin_user',
          p_target_id: variables.id,
          p_details: { email: variables.email, roles: variables.roles }
        }).catch((e: any) => console.warn('Audit log (update) failed', e));
      }
      setSelectedUser(null);
      editForm.reset();
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });

  // Delete admin user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting admin user:', userId);
      const { data, error } = await (supabase as any).rpc('delete_admin_user', {
        user_id: userId
      });
      
      if (error) {
        console.error('Error deleting admin user:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteDialogOpen(false);
      // Best-effort audit log
      if (adminUser?.id && userId) {
        (supabase as any).rpc('log_admin_action', {
          p_admin_user_id: adminUser.id,
          p_action: 'USER_DELETED',
          p_target_type: 'admin_user',
          p_target_id: userId,
          p_details: null
        }).catch((e: any) => console.warn('Audit log (delete) failed', e));
      }
      setSelectedUser(null);
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar usuario');
    },
  });

  // Toggle user active status
  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data, error } = await (supabase as any).rpc('toggle_admin_user_status', {
        user_id: userId,
        is_active: isActive
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      // Best-effort audit log
      if (adminUser?.id && variables?.userId) {
        const action = variables.isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED';
        (supabase as any).rpc('log_admin_action', {
          p_admin_user_id: adminUser.id,
          p_action: action,
          p_target_type: 'admin_user',
          p_target_id: variables.userId,
          p_details: { is_active: variables.isActive }
        }).catch((e: any) => console.warn('Audit log (toggle) failed', e));
      }
      toast.success('Estado actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });

  const handleCreateUser = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const handleEditUser = (data: EditUserForm) => {
    if (selectedUser) {
      editUserMutation.mutate({ ...data, id: selectedUser.id });
    }
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    editForm.reset({
      full_name: user.full_name,
      email: user.email,
      roles: user.roles || [],
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const filteredUsers = adminUsers.filter((user: any) => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin_master': return 'destructive';
      case 'moderador_contenido': return 'default';
      case 'gestor_establecimientos': return 'secondary';
      case 'soporte_tecnico': return 'outline';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin_master': return 'Admin Master';
      case 'moderador_contenido': return 'Moderador';
      case 'gestor_establecimientos': return 'Gestor';
      case 'soporte_tecnico': return 'Soporte';
      default: return role;
    }
  };

  if (!hasRole('admin_master')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              Solo los Admin Master pueden gestionar usuarios administrativos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios Administrativos</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios con acceso al panel administrativo
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Usuario Administrativo</DialogTitle>
              <DialogDescription>
                Crea un nuevo usuario con acceso al panel administrativo
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={APP_CONFIG.userEmailExample} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roles</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {availableRoles.map((role) => (
                            <div key={role.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={role.value}
                                checked={field.value.includes(role.value)}
                                onCheckedChange={(checked) => {
                                  const currentRoles = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentRoles, role.value]);
                                  } else {
                                    field.onChange(currentRoles.filter((r: string) => r !== role.value));
                                  }
                                }}
                              />
                              <label htmlFor={role.value} className="text-sm font-medium">
                                {role.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles?.map((role: string, index: number) => (
                          <Badge key={index} variant={getRoleBadgeVariant(role)}>
                            {getRoleLabel(role)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={(checked) => 
                            toggleUserMutation.mutate({ userId: user.id, isActive: checked })
                          }
                        />
                        <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario Administrativo</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario administrativo
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={APP_CONFIG.userEmailExample} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {availableRoles.map((role) => (
                          <div key={role.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${role.value}`}
                              checked={field.value.includes(role.value)}
                              onCheckedChange={(checked) => {
                                const currentRoles = field.value || [];
                                if (checked) {
                                  field.onChange([...currentRoles, role.value]);
                                } else {
                                  field.onChange(currentRoles.filter((r: string) => r !== role.value));
                                }
                              }}
                            />
                            <label htmlFor={`edit-${role.value}`} className="text-sm font-medium">
                              {role.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editUserMutation.isPending}>
                  {editUserMutation.isPending ? 'Actualizando...' : 'Actualizar Usuario'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{' '}
              <strong>{selectedUser?.full_name}</strong> y se removerán todos sus accesos administrativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar Usuario'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;