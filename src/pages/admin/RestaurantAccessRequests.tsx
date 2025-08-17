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
import { Eye, Search } from 'lucide-react';
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
  requester?: {
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

  // Check if user has the required role
  const hasRequiredRole = adminUser?.roles?.includes('gestor_establecimientos');

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['restaurant-access-requests', statusFilter, searchTerm],
    queryFn: async () => {
      // First get requests
      let requestQuery = supabase
        .from('restaurant_admin_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        requestQuery = requestQuery.eq('status', statusFilter);
      }

      if (searchTerm) {
        requestQuery = requestQuery.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data: requestsData, error: requestsError } = await requestQuery;

      if (requestsError) {
        console.error('Error fetching requests:', requestsError);
        toast.error('Error al cargar las solicitudes');
        throw requestsError;
      }

      if (!requestsData || requestsData.length === 0) {
        return [];
      }

      // Get unique user and restaurant IDs
      const userIds = [...new Set(requestsData.map(r => r.requester_user_id))];
      const restaurantIds = [...new Set(requestsData.map(r => r.restaurant_id))];

      // Fetch users data
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, username, avatar_url, email')
        .in('id', userIds);

      // Fetch restaurants data
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('id, name, address, location')
        .in('id', restaurantIds);

      // Create lookup maps
      const usersMap = new Map(usersData?.map(user => [user.id, user]) || []);
      const restaurantsMap = new Map(restaurantsData?.map(restaurant => [restaurant.id, restaurant]) || []);

      // Merge data
      const enrichedRequests = requestsData.map(request => ({
        ...request,
        requester: usersMap.get(request.requester_user_id),
        restaurant: restaurantsMap.get(request.restaurant_id),
      }));

      return enrichedRequests;
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                  <SelectItem value="revoked">Revocadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron solicitudes
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
                            @{request.requester?.username || 'sin_usuario'}
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