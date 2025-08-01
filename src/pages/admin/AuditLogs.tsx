import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Eye, Search, Filter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const AuditLogs: React.FC = () => {
  const { hasRole } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');

  // Fetch audit logs
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', actionFilter, targetFilter],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_admin_audit_logs', {
        p_action: actionFilter === 'all' ? null : actionFilter,
        p_target_type: targetFilter === 'all' ? null : targetFilter,
        p_limit: 100
      });
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredLogs = auditLogs.filter((log: any) => 
    log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE_USER':
      case 'CREATE_RESTAURANT':
        return 'default';
      case 'UPDATE_USER':
      case 'UPDATE_RESTAURANT':
        return 'secondary';
      case 'DELETE_USER':
      case 'DELETE_RESTAURANT':
        return 'destructive';
      case 'RESOLVE_REPORT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE_USER': return 'Usuario Creado';
      case 'UPDATE_USER': return 'Usuario Actualizado';
      case 'DELETE_USER': return 'Usuario Eliminado';
      case 'CREATE_RESTAURANT': return 'Restaurante Creado';
      case 'UPDATE_RESTAURANT': return 'Restaurante Actualizado';
      case 'DELETE_RESTAURANT': return 'Restaurante Eliminado';
      case 'RESOLVE_REPORT': return 'Reporte Resuelto';
      case 'DISMISS_REPORT': return 'Reporte Descartado';
      default: return action;
    }
  };

  if (!hasRole('admin_master')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              Solo los Admin Master pueden acceder a los logs de auditoría.
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
          <h1 className="text-3xl font-bold">Logs de Auditoría</h1>
          <p className="text-muted-foreground">
            Historial completo de acciones administrativas
          </p>
        </div>
        
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Acciones</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {auditLogs.filter((log: any) => 
                new Date(log.created_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <CalendarIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {auditLogs.filter((log: any) => {
                const logDate = new Date(log.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return logDate >= weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins Activos</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(auditLogs.map((log: any) => log.admin_user_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar por admin o acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="CREATE_USER">Crear Usuario</SelectItem>
                  <SelectItem value="UPDATE_USER">Actualizar Usuario</SelectItem>
                  <SelectItem value="DELETE_USER">Eliminar Usuario</SelectItem>
                  <SelectItem value="RESOLVE_REPORT">Resolver Reporte</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={targetFilter} onValueChange={setTargetFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="admin_user">Usuario Admin</SelectItem>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                  <SelectItem value="report">Reporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No se encontraron logs
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                    </TableCell>
                    <TableCell className="font-medium">{log.admin_name}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.target_type || 'Sistema'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {log.details && (
                        <div className="text-sm text-muted-foreground truncate">
                          {typeof log.details === 'string' 
                            ? log.details 
                            : JSON.stringify(log.details).substring(0, 50) + '...'
                          }
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.ip_address || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;