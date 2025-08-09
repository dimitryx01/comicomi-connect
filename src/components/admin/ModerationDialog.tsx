
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Calendar, User, FileText, Image as ImageIcon, MapPin, History, AlertTriangle, CheckCircle, XCircle, Link as LinkIcon, RotateCcw } from 'lucide-react';
import { useReportDetails, useContentDetails, useModerationAction, useModerationHistory, useResolveReportsOnly, type GroupedReport, type ModerationAction, useModerationReasons } from '@/hooks/useGroupedReports';
import { OriginalContentImage } from '@/components/post/OriginalContentImage';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ModerationDialogProps {
  report: GroupedReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModerationDialog: React.FC<ModerationDialogProps> = ({
  report,
  open,
  onOpenChange,
}) => {
  const [selectedAction, setSelectedAction] = useState<ModerationAction['action_type']>('keep');
  const [actionNotes, setActionNotes] = useState('');
  const [actionMode, setActionMode] = useState<'normal' | 'resolve_only' | 'retry'>('normal');
  const [reasonCode, setReasonCode] = useState<string | undefined>(undefined);

  const { data: reportDetails, isLoading: loadingReports } = useReportDetails(
    report?.report_ids || []
  );
  const { data: contentDetails, isLoading: loadingContent } = useContentDetails(
    report?.content_type || '',
    report?.content_id || ''
  );
  const { data: moderationHistory, isLoading: loadingHistory } = useModerationHistory(
    report?.content_type || '',
    report?.content_id || ''
  );
  const { data: reasons = [], isLoading: loadingReasons } = useModerationReasons();
  
  const moderationMutation = useModerationAction();
  const resolveOnlyMutation = useResolveReportsOnly();

  const contentStatus = React.useMemo(() => {
    if (loadingContent || !contentDetails) return 'loading';

    const hasHistory = Array.isArray(moderationHistory) && moderationHistory.length > 0;
    const latestAction = hasHistory ? moderationHistory[0] : null;

    const type = report?.content_type;
    const softDeletable = type === 'post' || type === 'recipe';

    const exists = contentDetails.exists !== false; // default to true when undefined
    const isPublic = (contentDetails as any).is_public;
    const isReported = (contentDetails as any).is_reported;

    if (softDeletable) {
      // Soft delete = hidden when not public or reported
      const hidden = isPublic === false || isReported === true;

      if (hidden) return 'deleted';

      if (latestAction?.action_type === 'delete' && hidden === false) {
        return 'delete_failed';
      }

      if (hasHistory) return 're_reported';
      return 'new';
    } else {
      // Hard delete (comments/others): rely on existence
      if (!exists) {
        if (latestAction?.action_type === 'delete') return 'deleted';
        return 'missing';
      }

      if (hasHistory && latestAction?.action_type !== 'delete') return 're_reported';
      return 'new';
    }
  }, [contentDetails, moderationHistory, loadingContent, report?.content_type]);

  React.useEffect(() => {
    if (contentStatus === 'deleted') {
      setActionMode('resolve_only');
      setSelectedAction('keep');
    } else if (contentStatus === 'delete_failed') {
      setActionMode('retry');
      setSelectedAction('delete');
    } else {
      setActionMode('normal');
    }
  }, [contentStatus]);

  const getContentLink = (type: string, id: string) => {
    switch (type) {
      case 'post': return `/post/${id}`;
      case 'recipe': return `/recipe/${id}`;
      case 'restaurant': return `/restaurant/${id}`;
      case 'shared_post': return `/shared/${id}`;
      default: return '#';
    }
  };

  const handleAction = () => {
    if (!report || !contentDetails) return;

    if (actionMode === 'resolve_only') {
      resolveOnlyMutation.mutate({
        reportIds: report.report_ids,
        notes: actionNotes || 'Contenido ya eliminado - reportes marcados como resueltos'
      }, {
        onSuccess: () => {
          onOpenChange(false);
          setActionNotes('');
          setReasonCode(undefined);
        },
      });
      return;
    }

    const action: ModerationAction = {
      action_type: selectedAction,
      action_notes: actionNotes,
      report_ids: report.report_ids,
      content_type: report.content_type,
      content_id: report.content_id,
      author_id: contentDetails.author?.id,
      reason_code: reasonCode || null,
    };

    moderationMutation.mutate(action, {
      onSuccess: () => {
        onOpenChange(false);
        setSelectedAction('keep');
        setActionNotes('');
        setReasonCode(undefined);
      },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'keep': return 'Mantener contenido';
      case 'edit': return 'Editar contenido';
      case 'delete': return 'Ocultar (reportado)';
      case 'restore': return 'Restaurar contenido';
      case 'suspend_user_temp': return 'Suspender usuario temporalmente';
      case 'suspend_user_perm': return 'Suspender usuario permanentemente';
      case 'resolve': return 'Marcar reportes como resueltos';
      default: return action;
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

  const renderMediaContent = (mediaUrls: { images?: string[]; videos?: string[] }) => {
    if (!mediaUrls?.images || !Array.isArray(mediaUrls.images) || mediaUrls.images.length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {mediaUrls.images.slice(0, 4).map((fileId, index) => (
          <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
            <OriginalContentImage
              fileId={fileId}
              alt={`Contenido ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        {mediaUrls.images.length > 4 && (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              +{mediaUrls.images.length - 4} más
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Moderación de {getContentTypeLabel(report.content_type)}
            <Badge variant={getPriorityColor(report.priority_level)}>
              {report.priority_level.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {report.report_count} reportes para este contenido
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Información del autor y contenido */}
            {loadingContent ? (
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ) : contentDetails ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {contentDetails.author && (
                      <Avatar>
                        <AvatarImage src={contentDetails.author.avatar_url} />
                        <AvatarFallback>
                          {contentDetails.author.full_name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">Contenido Reportado</CardTitle>
                      {contentDetails.author && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{contentDetails.author.full_name} (@{contentDetails.author.username})</span>
                          <span>•</span>
                          <span>{contentDetails.author.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(new Date(contentDetails.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    {contentDetails.title && (
                      <h3 className="font-semibold text-lg mb-2">{contentDetails.title}</h3>
                    )}
                    {contentDetails.name && (
                      <h3 className="font-semibold text-lg mb-2">{contentDetails.name}</h3>
                    )}
                    {contentDetails.content && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">Contenido:</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{contentDetails.content}</p>
                      </div>
                    )}
                    {contentDetails.description && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">Descripción:</span>
                        </div>
                        <p className="text-sm">{contentDetails.description}</p>
                      </div>
                    )}
                  </div>

                  {contentDetails.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{contentDetails.location}</span>
                    </div>
                  )}

                  {contentDetails.image_url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <OriginalContentImage
                        fileId={contentDetails.image_url}
                        alt="Contenido reportado"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  {contentDetails.media_urls && renderMediaContent(contentDetails.media_urls as { images?: string[]; videos?: string[] })}
                </CardContent>
              </Card>
            ) : null}

            {/* Lista de reportes */}
            <Card>
              <CardHeader>
                <CardTitle>Reportes Recibidos ({report.report_count})</CardTitle>
                <CardDescription>
                  Desde {formatDistanceToNow(new Date(report.first_report_at), { locale: es })} hasta {formatDistanceToNow(new Date(report.last_report_at), { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingReports ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : reportDetails ? (
                  <div className="space-y-4">
                    {reportDetails.map((reportDetail, index) => (
                      <div key={reportDetail.id}>
                        {index > 0 && <Separator />}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {getTypeLabel(reportDetail.report_type)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(reportDetail.created_at), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </span>
                            </div>
                            {reportDetail.reporter && (
                              <div className="flex items-center gap-2 text-sm">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={reportDetail.reporter.avatar_url} />
                                  <AvatarFallback>
                                    {reportDetail.reporter.full_name?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{reportDetail.reporter.full_name}</span>
                              </div>
                            )}
                          </div>
                          {reportDetail.description && (
                            <p className="text-sm bg-muted/50 p-2 rounded">
                              {reportDetail.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Estado del contenido */}
            {!loadingContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {contentStatus === 'deleted' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {contentStatus === 'delete_failed' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    {contentStatus === 'missing' && <XCircle className="h-5 w-5 text-red-500" />}
                    {contentStatus === 're_reported' && <History className="h-5 w-5 text-blue-500" />}
                    {contentStatus === 'new' && <AlertCircle className="h-5 w-5 text-gray-500" />}
                    Estado del Contenido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contentStatus === 'deleted' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Contenido ocultado exitosamente (reportado)
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Este contenido fue marcado como reportado y oculto. Puedes restaurarlo si fue un error.
                        </p>
                      </div>
                    )}
                    {contentStatus === 'delete_failed' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-yellow-800">
                          ⚠️ Ocultación fallida detectada
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Se intentó ocultar este contenido pero aún existe. Puedes reintentar la acción.
                        </p>
                      </div>
                    )}
                    {contentStatus === 'missing' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-red-800">
                          ❌ Contenido no encontrado
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Este contenido no existe en la base de datos. Puede haber sido eliminado por el autor.
                        </p>
                      </div>
                    )}
                    {contentStatus === 're_reported' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-800">
                          🔄 Contenido re-reportado
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Este contenido ya fue moderado anteriormente. Revisa el historial antes de tomar una nueva acción.
                        </p>
                      </div>
                    )}
                    {contentStatus === 'new' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800">
                          📝 Nuevo reporte
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Este es un nuevo reporte que requiere moderación.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historial de moderación */}
            {moderationHistory && moderationHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historial de Moderación
                  </CardTitle>
                  <CardDescription>
                    Acciones previas tomadas sobre este contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moderationHistory.map((action) => (
                      <div key={action.id} className="border-l-2 border-muted pl-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={action.action_type === 'delete' ? 'destructive' : action.action_type === 'restore' ? 'default' : 'outline'}>
                              {getActionLabel(action.action_type)}
                            </Badge>
                            {action.reason_label && (
                              <Badge variant="secondary">{action.reason_label}</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(action.created_at), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {action.admin_name || 'Admin'}
                          </span>
                        </div>
                        {action.action_notes && (
                          <p className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
                            {action.action_notes}
                          </p>
                        )}

                        {(action.previous_state || action.new_state) && (
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="bg-muted/40 rounded p-2">
                              <p className="text-xs font-semibold mb-1">Estado anterior</p>
                              <pre className="text-xs whitespace-pre-wrap text-muted-foreground">{JSON.stringify(action.previous_state, null, 2)}</pre>
                            </div>
                            <div className="bg-muted/40 rounded p-2">
                              <p className="text-xs font-semibold mb-1">Estado nuevo</p>
                              <pre className="text-xs whitespace-pre-wrap text-muted-foreground">{JSON.stringify(action.new_state, null, 2)}</pre>
                            </div>
                          </div>
                        )}

                        <div className="mt-2">
                          <a
                            href={getContentLink(report.content_type, report.content_id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:underline"
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            Ver contenido
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones de moderación */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {actionMode === 'resolve_only' ? 'Resolver Reportes' : 
                   actionMode === 'retry' ? 'Reintentar Acción' : 
                   'Acción de Moderación'}
                </CardTitle>
                <CardDescription>
                  {actionMode === 'resolve_only' ? 'Marcar reportes como resueltos sin acciones adicionales' :
                   actionMode === 'retry' ? 'Reintentar la acción de moderación que falló previamente' :
                   'Selecciona la acción a tomar para resolver estos reportes'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionMode !== 'resolve_only' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Acción:</label>
                      <Select value={selectedAction} onValueChange={(value) => setSelectedAction(value as ModerationAction['action_type'])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="keep">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              {getActionLabel('keep')}
                            </div>
                          </SelectItem>
                          <SelectItem value="edit">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              {getActionLabel('edit')}
                            </div>
                          </SelectItem>
                          <SelectItem value="delete">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              {getActionLabel('delete')}
                            </div>
                          </SelectItem>
                          {/* Restore only makes sense for post/recipe */}
                          {(report?.content_type === 'post' || report?.content_type === 'recipe') && (
                            <SelectItem value="restore">
                              <div className="flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" />
                                {getActionLabel('restore')}
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Motivo predefinido (opcional):
                      </label>
                      <Select value={reasonCode} onValueChange={(value) => setReasonCode(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingReasons ? 'Cargando motivos...' : 'Selecciona un motivo'} />
                        </SelectTrigger>
                        <SelectContent>
                          {reasons.map((r) => (
                            <SelectItem key={r.code} value={r.code}>
                              {r.label} {r.category ? `• ${r.category}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Notas adicionales (opcional):
                  </label>
                  <Textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Agregar notas sobre la decisión tomada..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={moderationMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAction}
            disabled={moderationMutation.isPending || resolveOnlyMutation.isPending}
            className={
              (selectedAction === 'delete' || selectedAction.includes('suspend')) && actionMode !== 'resolve_only'
                ? 'bg-destructive hover:bg-destructive/90'
                : ''
            }
          >
            {(moderationMutation.isPending || resolveOnlyMutation.isPending) ? 'Procesando...' : 
             actionMode === 'resolve_only' ? 'Marcar como Resueltos' :
             actionMode === 'retry' ? `Reintentar: ${getActionLabel(selectedAction)}` :
             `Aplicar: ${getActionLabel(selectedAction)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModerationDialog;
