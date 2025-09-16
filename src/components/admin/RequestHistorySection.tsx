import React from 'react';
import { useUserRestaurantRequestHistory } from '@/hooks/useRestaurantRequestHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface RequestHistorySectionProps {
  userId: string;
  restaurantId: string;
  currentRequestId: string;
}

export const RequestHistorySection: React.FC<RequestHistorySectionProps> = ({
  userId,
  restaurantId,
  currentRequestId,
}) => {
  const { data: history = [], isLoading } = useUserRestaurantRequestHistory(userId, restaurantId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'revoked':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Solicitudes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Cargando historial...</div>
        </CardContent>
      </Card>
    );
  }

  if (history.length <= 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Solicitudes
          </CardTitle>
          <CardDescription>
            No hay solicitudes anteriores para este usuario en este restaurante.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Filtrar la solicitud actual para mostrar solo el historial
  const previousRequests = history.filter(request => request.id !== currentRequestId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Historial de Solicitudes ({previousRequests.length})
        </CardTitle>
        <CardDescription>
          Solicitudes anteriores de este usuario para este restaurante.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {previousRequests.map((request, index) => (
            <div key={request.id}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(request.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Solicitud #{index + 1}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(request.created_at)}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div><strong>Nombre:</strong> {request.full_name}</div>
                    <div><strong>Razón social:</strong> {request.legal_name}</div>
                    <div><strong>Email:</strong> {request.email}</div>
                    {request.phone && <div><strong>Teléfono:</strong> {request.phone}</div>}
                  </div>

                  {request.moderated_at && (
                    <div className="mt-2 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          Moderado el {formatDate(request.moderated_at)}
                          {request.moderator?.full_name && ` por ${request.moderator.full_name}`}
                        </span>
                      </div>
                      {request.moderation_notes && (
                        <div className="mt-1 p-2 bg-muted rounded text-muted-foreground">
                          <strong>Notas:</strong> {request.moderation_notes}
                        </div>
                      )}
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      ✓ Esta solicitud fue aprobada y se le otorgó acceso al restaurante.
                    </div>
                  )}

                  {request.status === 'revoked' && (
                    <div className="mt-2 text-sm text-orange-700 bg-orange-50 p-2 rounded">
                      ⚠️ El acceso concedido por esta solicitud fue posteriormente revocado.
                    </div>
                  )}
                </div>
              </div>
              
              {index < previousRequests.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>

        {previousRequests.some(r => r.status === 'revoked') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Aviso importante</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Este usuario ha tenido solicitudes revocadas anteriormente. Considere esto al evaluar la solicitud actual.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};