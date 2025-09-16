import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Search, History, User, Building } from 'lucide-react';
import { AccessRequestDetailDialog } from '@/components/admin/AccessRequestDetailDialog';
import { toast } from 'sonner';

interface RestaurantAdminRequest {
  id: string;
  restaurant_id: string;
  requester_user_id: string;
  full_name: string;
  legal_name: string;
  tax_id: string;
  email: string;
  phone: string;
  status: string;
  moderation_notes?: string;
  moderated_by_admin_id?: string;
  moderated_at?: string;
  created_at: string;
  updated_at: string;
  dni_scan_url?: string;
  selfie_url?: string;
  ownership_proof_url?: string;
  requester_user?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    email?: string;
  };
  restaurant?: {
    id: string;
    name?: string;
    address?: string;
    location?: string;
  };
}

const RestaurantAccessRequests: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [selectedRequest, setSelectedRequest] = useState<RestaurantAdminRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Check if user has the required role
  const hasRequiredRole = adminUser?.roles?.includes('gestor_establecimientos');

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['restaurant-access-requests', activeTab, searchTerm],
    queryFn: async () => {
      console.log('[DEBUG] RestaurantAccessRequests: Fetching requests with filters:', { activeTab, searchTerm });
      
      if (!adminUser?.id) {
        throw new Error('Admin user not found');
      }

      const { data, error } = await supabase.functions.invoke('admin-get-restaurant-requests', {
        body: {
          admin_user_id: adminUser.id,
          status_filter: activeTab !== 'all' ? activeTab : null,
          search_term: searchTerm || null
        }
      });

      if (error) {
        console.error('[ERROR] RestaurantAccessRequests: Error fetching requests:', error);
        toast.error('Error al cargar las solicitudes');
        throw error;
      }

      if (data?.error) {
        console.error('[ERROR] RestaurantAccessRequests: Function returned error:', data.error);
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log('[DEBUG] RestaurantAccessRequests: Fetched requests:', data?.data?.length || 0);
      return data?.data as RestaurantAdminRequest[] || [];
    },
    enabled: hasRequiredRole,
  });

  if (!hasRequiredRole) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para gestionar solicitudes de acceso a restaurantes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      approved: 'default',
      rejected: 'destructive',
      revoked: 'secondary',
    } as const;

    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      revoked: 'Revocada',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Contar solicitudes por estado
  const getRequestCounts = () => {
    const counts = {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      revoked: requests.filter(r => r.status === 'revoked').length,
    };
    return counts;
  };

  const counts = getRequestCounts();

  const handleRequestUpdate = () => {
    refetch();
    setSelectedRequest(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Acceso a Restaurantes</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las solicitudes de administración de restaurantes
          </p>
        </div>

        {/* Filtros de búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs por estado */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              Todas ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pendientes ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              Aprobadas ({counts.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              Rechazadas ({counts.rejected})
            </TabsTrigger>
            <TabsTrigger value="revoked" className="flex items-center gap-2">
              Revocadas ({counts.revoked})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'all' ? 'Todas las solicitudes' : 
                   activeTab === 'pending' ? 'Solicitudes pendientes' :
                   activeTab === 'approved' ? 'Solicitudes aprobadas' :
                   activeTab === 'rejected' ? 'Solicitudes rechazadas' :
                   'Solicitudes revocadas'} ({requests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Cargando...</div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron solicitudes para este estado
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Solicitante</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Restaurante</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="font-medium">{request.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                @{request.requester_user?.username || 'sin_usuario'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {request.requester_user_id.slice(0, 8)}...
                              </div>
                            </TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.phone}</TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {request.restaurant?.name || 'Restaurante no encontrado'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {request.restaurant_id.slice(0, 8)}...
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              {new Date(request.created_at).toLocaleDateString('es-ES')}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      {selectedRequest && (
        <AccessRequestDetailDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
          onUpdate={handleRequestUpdate}
        />
      )}
    </div>
  );
};

export default RestaurantAccessRequests;