import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Clock, User, Target, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const getActionBadgeVariant = (action: string) => {
  if (action.includes('DELETE')) return 'destructive';
  if (action.includes('SUSPEND')) return 'destructive';
  if (action.includes('EDIT')) return 'secondary';
  if (action.includes('KEEP')) return 'default';
  return 'outline';
};

const getActionLabel = (action: string) => {
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
  return actionMap[action] || action;
};

const getTargetTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'post': 'Publicación',
    'recipe': 'Receta', 
    'comment': 'Comentario',
    'restaurant': 'Restaurante',
    'user': 'Usuario',
    'report': 'Reporte'
  };
  return typeMap[type] || type;
};

export const RecentActivity: React.FC = () => {
  const { data: recentLogs, isLoading, error } = useAuditLogs({ limit: 10 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Error al cargar la actividad reciente</p>
        </CardContent>
      </Card>
    );
  }

  if (!recentLogs || recentLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay actividad reciente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLogs.map((log) => (
            <div key={log.id} className="border-l-2 border-primary/20 pl-4 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                    {log.target_type && (
                      <Badge variant="outline">
                        {getTargetTypeLabel(log.target_type)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <User className="h-3 w-3" />
                    <span className="font-medium">{log.admin_name}</span>
                  </div>
                  
                  {log.details && (
                    <div className="text-xs text-muted-foreground">
                      {log.details.action_notes && (
                        <p className="truncate">{log.details.action_notes}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(log.created_at), { 
                    addSuffix: true,
                    locale: es 
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};