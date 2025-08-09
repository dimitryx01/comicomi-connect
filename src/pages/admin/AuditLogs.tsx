import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAuditLogs, useAuditLogStats } from '@/hooks/useAuditLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Eye, Search, Filter, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const AuditLogs: React.FC = () => {
  const { hasRole } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  
  const { data: auditLogs = [], isLoading, error } = useAuditLogs({
    action: actionFilter || undefined,
    targetType: targetFilter || undefined,
    limit: 100
  });
  
  const { data: stats = { totalActions: 0, todayActions: 0, weekActions: 0, activeAdmins: 0 } } = useAuditLogStats();

  const filteredLogs = auditLogs.filter(log => {
    const actionStr = (log.action || '').toLowerCase();
    const adminStr = (log.admin_name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = actionStr.includes(search) || adminStr.includes(search);
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesTarget = !targetFilter || log.target_type === targetFilter;
    
    return matchesSearch && matchesAction && matchesTarget;
  });

  const getActionBadgeVariant = (action?: string) => {
    const a = action || '';
    if (a.includes('DELETE')) return 'destructive';
    if (a.includes('SUSPEND')) return 'destructive';
    if (a.includes('EDIT')) return 'secondary';
    if (a.includes('KEEP')) return 'default';
    return 'outline';
  };

  const getActionLabel = (action?: string) => {
    const actionMap: Record<string, string> = {
      'MODERATION_DELETE': 'Eliminar Contenido',
      'MODERATION_KEEP': 'Mantener Contenido', 
      'MODERATION_EDIT': 'Editar Contenido',
      'MODERATION_SUSPEND': 'Suspender Usuario',
      'REPORT_RESOLVED': 'Reporte Resuelto',
      'USER_CREATED': 'Usuario Creado',
      'USER_UPDATED': 'Usuario Actualizado',
      'USER_SUSPENDED': 'Usuario Suspendido'
    };
    return (action && actionMap[action]) || action || 'Acción';
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
            <div className="text-2xl font-bold">{stats.totalActions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              Todas las acciones realizadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acciones Hoy</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todayActions}</div>
            <p className="text-sm text-muted-foreground">
              Acciones realizadas hoy
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <CalendarIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.weekActions}</div>
            <p className="text-sm text-muted-foreground">
              Acciones realizadas esta semana
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins Activos</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.activeAdmins}</div>
            <p className="text-sm text-muted-foreground">
              Administradores activos esta semana
            </p>
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
                  <SelectItem value="">Todas las acciones</SelectItem>
                  <SelectItem value="MODERATION_DELETE">Eliminar Contenido</SelectItem>
                  <SelectItem value="MODERATION_KEEP">Mantener Contenido</SelectItem>
                  <SelectItem value="MODERATION_EDIT">Editar Contenido</SelectItem>
                  <SelectItem value="MODERATION_SUSPEND">Suspender Usuario</SelectItem>
                  <SelectItem value="REPORT_RESOLVED">Reporte Resuelto</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={targetFilter} onValueChange={setTargetFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value="post">Publicación</SelectItem>
                  <SelectItem value="recipe">Receta</SelectItem>
                  <SelectItem value="comment">Comentario</SelectItem>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error al cargar los logs</AlertTitle>
              <AlertDescription>
                {(error as any)?.message || 'Ocurrió un error inesperado.'}
              </AlertDescription>
            </Alert>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>ID destino</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Cargando registros de auditoría...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                      <p>No hay registros de auditoría disponibles</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {(() => {
                        const d = log.created_at ? new Date(log.created_at) : null;
                        if (!d || isNaN(d.getTime())) return '-';
                        return formatDistanceToNow(d, { addSuffix: true, locale: es });
                      })()}
                    </TableCell>
                    <TableCell>{log.admin_name}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.target_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {log.details?.action_notes && (
                        <span className="truncate block">{log.details.action_notes}</span>
                      )}
                      {log.details?.report_count && (
                        <span className="text-xs text-muted-foreground">
                          {log.details.report_count} reportes
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.target_id ? log.target_id.slice(0, 8) : '-'}
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