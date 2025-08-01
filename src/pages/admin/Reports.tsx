import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Report {
  id: string;
  report_type: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
  reporter_id: string;
  reported_user_id?: string;
  post_id?: string;
  recipe_id?: string;
  comment_id?: string;
  restaurant_id?: string;
  review_id?: string;
}

const Reports: React.FC = () => {
  const { hasAnyRole } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss'>('resolve');
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Resolve/dismiss report mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, notes }: { reportId: string; status: string; notes: string }) => {
      const { error } = await (supabase as any)
        .from('reports')
        .update({
          status: status,
          admin_notes: notes,
          resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null,
        })
        .eq('id', reportId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setActionDialogOpen(false);
      setSelectedReport(null);
      setAdminNotes('');
      toast.success('Reporte actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar reporte');
    },
  });

  const filteredReports = reports.filter((report: Report) => {
    const matchesSearch = report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.report_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'reviewing': return 'default';
      case 'resolved': return 'secondary';
      case 'dismissed': return 'outline';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'reviewing': return 'En Revisión';
      case 'resolved': return 'Resuelto';
      case 'dismissed': return 'Descartado';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'spam': return 'Spam';
      case 'harassment': return 'Acoso';
      case 'inappropriate_content': return 'Contenido Inapropiado';
      case 'fake_information': return 'Información Falsa';
      case 'copyright': return 'Derechos de Autor';
      case 'hate_speech': return 'Discurso de Odio';
      case 'violence': return 'Violencia';
      case 'other': return 'Otro';
      default: return type;
    }
  };

  const openDetailsDialog = (report: Report) => {
    setSelectedReport(report);
    setDetailsDialogOpen(true);
  };

  const openActionDialog = (report: Report, action: 'resolve' | 'dismiss') => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNotes('');
    setActionDialogOpen(true);
  };

  const handleAction = () => {
    if (selectedReport) {
      updateReportMutation.mutate({
        reportId: selectedReport.id,
        status: actionType === 'resolve' ? 'resolved' : 'dismissed',
        notes: adminNotes,
      });
    }
  };

  // Statistics
  const stats = {
    total: reports.length,
    pending: reports.filter((r: Report) => r.status === 'pending').length,
    reviewing: reports.filter((r: Report) => r.status === 'reviewing').length,
    resolved: reports.filter((r: Report) => r.status === 'resolved').length,
  };

  if (!hasAnyRole(['admin_master', 'moderador_contenido'])) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              Solo los Admin Master y Moderadores pueden acceder al módulo de reportes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes y Moderación</h1>
        <p className="text-muted-foreground">
          Gestiona reportes de contenido y modera publicaciones
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.reviewing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="reviewing">En Revisión</SelectItem>
                  <SelectItem value="resolved">Resueltos</SelectItem>
                  <SelectItem value="dismissed">Descartados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Acoso</SelectItem>
                  <SelectItem value="inappropriate_content">Contenido Inapropiado</SelectItem>
                  <SelectItem value="fake_information">Información Falsa</SelectItem>
                  <SelectItem value="copyright">Derechos de Autor</SelectItem>
                  <SelectItem value="hate_speech">Discurso de Odio</SelectItem>
                  <SelectItem value="violence">Violencia</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Cargando reportes...
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No se encontraron reportes
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report: Report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(report.report_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDetailsDialog(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-600"
                              onClick={() => openActionDialog(report, 'resolve')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600"
                              onClick={() => openActionDialog(report, 'dismiss')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles del Reporte</DialogTitle>
            <DialogDescription>
              Información completa del reporte seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de Reporte:</label>
                <p className="text-sm text-muted-foreground">
                  {getTypeLabel(selectedReport.report_type)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción:</label>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.description}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Estado:</label>
                <p className="text-sm text-muted-foreground">
                  {getStatusLabel(selectedReport.status)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Fecha de Creación:</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedReport.created_at).toLocaleString()}
                </p>
              </div>
              {selectedReport.resolved_at && (
                <div>
                  <label className="text-sm font-medium">Fecha de Resolución:</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedReport.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedReport.admin_notes && (
                <div>
                  <label className="text-sm font-medium">Notas del Administrador:</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'resolve' ? 'Resolver Reporte' : 'Descartar Reporte'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'resolve' 
                ? 'Marca este reporte como resuelto. Puedes agregar notas adicionales.'
                : 'Marca este reporte como descartado. Puedes agregar notas sobre por qué se descarta.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notas del Administrador (opcional):</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Agregar notas sobre la resolución..."
                className="mt-2"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={updateReportMutation.isPending}
              className={actionType === 'resolve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {updateReportMutation.isPending 
                ? 'Procesando...' 
                : actionType === 'resolve' ? 'Resolver' : 'Descartar'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reports;