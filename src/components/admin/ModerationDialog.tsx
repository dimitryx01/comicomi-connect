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
import { AlertCircle, Calendar, User, FileText, Image as ImageIcon, MapPin } from 'lucide-react';
import { useReportDetails, useContentDetails, useModerationAction, type GroupedReport, type ModerationAction } from '@/hooks/useGroupedReports';
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

  const { data: reportDetails, isLoading: loadingReports } = useReportDetails(
    report?.report_ids || []
  );
  
  const { data: contentDetails, isLoading: loadingContent } = useContentDetails(
    report?.content_type || '',
    report?.content_id || ''
  );
  
  const moderationMutation = useModerationAction();

  const handleAction = () => {
    if (!report || !contentDetails) return;

    const action: ModerationAction = {
      action_type: selectedAction,
      action_notes: actionNotes,
      report_ids: report.report_ids,
      content_type: report.content_type,
      content_id: report.content_id,
      author_id: contentDetails.author?.id,
    };

    moderationMutation.mutate(action, {
      onSuccess: () => {
        onOpenChange(false);
        setSelectedAction('keep');
        setActionNotes('');
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
      case 'delete': return 'Eliminar contenido';
      case 'suspend_user_temp': return 'Suspender usuario temporalmente';
      case 'suspend_user_perm': return 'Suspender usuario permanentemente';
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
                  {/* Contenido principal */}
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

                  {/* Ubicación */}
                  {contentDetails.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{contentDetails.location}</span>
                    </div>
                  )}

                  {/* Imagen principal */}
                  {contentDetails.image_url && (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <OriginalContentImage
                        fileId={contentDetails.image_url}
                        alt="Contenido reportado"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  {/* Media URLs */}
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

            {/* Acciones de moderación */}
            <Card>
              <CardHeader>
                <CardTitle>Acción de Moderación</CardTitle>
                <CardDescription>
                  Selecciona la acción a tomar para resolver estos reportes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <SelectItem value="suspend_user_temp">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          {getActionLabel('suspend_user_temp')}
                        </div>
                      </SelectItem>
                      <SelectItem value="suspend_user_perm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-black"></div>
                          {getActionLabel('suspend_user_perm')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
            disabled={moderationMutation.isPending}
            className={
              selectedAction === 'delete' || selectedAction.includes('suspend')
                ? 'bg-destructive hover:bg-destructive/90'
                : ''
            }
          >
            {moderationMutation.isPending ? 'Procesando...' : `Aplicar: ${getActionLabel(selectedAction)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModerationDialog;