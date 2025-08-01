import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, AlertTriangle, Users, Calendar, Flag } from 'lucide-react';
import { useGroupedReports, type GroupedReport } from '@/hooks/useGroupedReports';
import ModerationDialog from '@/components/admin/ModerationDialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


const Reports: React.FC = () => {
  const { hasAnyRole } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<GroupedReport | null>(null);
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);

  // Fetch grouped reports
  const { data: reports = [], isLoading } = useGroupedReports();


  const filteredReports = reports.filter((report: GroupedReport) => {
    const matchesSearch = report.content_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.report_types?.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || report.priority_level === priorityFilter;
    const matchesType = typeFilter === 'all' || report.report_types?.includes(typeFilter);
    
    return matchesSearch && matchesPriority && matchesType;
  });

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'CRÍTICO';
      case 'high': return 'ALTO';
      case 'medium': return 'MEDIO';
      case 'low': return 'BAJO';
      default: return priority.toUpperCase();
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return 'Publicación';
      case 'recipe': return 'Receta';
      case 'comment': return 'Comentario';
      case 'restaurant': return 'Restaurante';
      case 'review': return 'Reseña';
      default: return type;
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

  const openModerationDialog = (report: GroupedReport) => {
    setSelectedReport(report);
    setModerationDialogOpen(true);
  };

  // Statistics
  const stats = {
    total: reports.length,
    critical: reports.filter((r: GroupedReport) => r.priority_level === 'critical').length,
    high: reports.filter((r: GroupedReport) => r.priority_level === 'high').length,
    pending: reports.filter((r: GroupedReport) => 
      r.statuses.includes('pending') && !r.has_moderation_action
    ).length,
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
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Contenidos Reportados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Prioridad Crítica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Prioridad Alta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
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
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
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
                <TableHead>Contenido</TableHead>
                <TableHead>Reportes</TableHead>
                <TableHead>Tipos de Reporte</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Último Reporte</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando reportes...
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron reportes
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report: GroupedReport) => (
                  <TableRow key={`${report.content_type}-${report.content_id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getContentTypeLabel(report.content_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ID: {report.content_id.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{report.report_count}</span>
                        <span className="text-sm text-muted-foreground">reportes</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {report.report_types.slice(0, 2).map((type, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {getTypeLabel(type)}
                          </Badge>
                        ))}
                        {report.report_types.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{report.report_types.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(report.priority_level)}>
                        {getPriorityLabel(report.priority_level)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(report.last_report_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.has_moderation_action ? (
                        <Badge variant="secondary">Moderado</Badge>
                      ) : (
                        <Badge variant="destructive">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openModerationDialog(report)}
                          disabled={report.has_moderation_action}
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Moderation Dialog */}
      <ModerationDialog
        report={selectedReport}
        open={moderationDialogOpen}
        onOpenChange={setModerationDialogOpen}
      />
    </div>
  );
};

export default Reports;