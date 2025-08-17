import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Building, FileText, Phone, Mail, Calendar, MessageSquare } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface AccessRequestDetailDialogProps {
  request: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const AccessRequestDetailDialog: React.FC<AccessRequestDetailDialogProps> = ({
  request,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showRevocationForm, setShowRevocationForm] = useState(false);
  
  // Form states
  const [dniUrl, setDniUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [ownershipUrl, setOwnershipUrl] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleApprove = async () => {
    if (!dniUrl || !selfieUrl || !ownershipUrl) {
      toast.error('Todos los documentos son obligatorios para aprobar la solicitud');
      return;
    }

    setIsApproving(true);
    try {
      const { data, error } = await supabase.rpc('admin_approve_restaurant_access', {
        request_id: request.id,
        dni_url: dniUrl,
        selfie_url: selfieUrl,
        ownership_url: ownershipUrl,
        notes: notes || null,
      });

      if (error) throw error;
      if (!data) throw new Error('Error al aprobar la solicitud');

      toast.success('Solicitud aprobada correctamente');
      onUpdate();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error('Error al aprobar la solicitud');
    } finally {
      setIsApproving(false);
      setShowApprovalForm(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Las notas de moderación son obligatorias para rechazar');
      return;
    }

    setIsRejecting(true);
    try {
      const { data, error } = await supabase.rpc('admin_reject_restaurant_access', {
        request_id: request.id,
        notes: notes,
      });

      if (error) throw error;
      if (!data) throw new Error('Error al rechazar la solicitud');

      toast.success('Solicitud rechazada correctamente');
      onUpdate();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error('Error al rechazar la solicitud');
    } finally {
      setIsRejecting(false);
      setShowRejectionForm(false);
    }
  };

  const handleRevoke = async () => {
    if (!notes.trim()) {
      toast.error('Las notas de moderación son obligatorias para revocar');
      return;
    }

    setIsRevoking(true);
    try {
      const { data, error } = await supabase.rpc('admin_revoke_restaurant_access', {
        request_id: request.id,
        notes: notes,
      });

      if (error) throw error;
      if (!data) throw new Error('Error al revocar el acceso');

      toast.success('Acceso revocado correctamente');
      onUpdate();
    } catch (error: any) {
      console.error('Error revoking access:', error);
      toast.error('Error al revocar el acceso');
    } finally {
      setIsRevoking(false);
      setShowRevocationForm(false);
    }
  };

  const resetForms = () => {
    setShowApprovalForm(false);
    setShowRejectionForm(false);
    setShowRevocationForm(false);
    setDniUrl('');
    setSelfieUrl('');
    setOwnershipUrl('');
    setNotes('');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForms();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Solicitud de Acceso</DialogTitle>
          <DialogDescription>
            Revisa la información de la solicitud y toma una decisión
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.user?.avatar_url} />
                  <AvatarFallback>
                    {request.user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.user?.full_name || 'Usuario no encontrado'}</p>
                  <p className="text-sm text-muted-foreground">@{request.user?.username}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{request.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{request.phone}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">ID de Usuario:</p>
                <p className="text-sm text-muted-foreground font-mono">{request.requester_user_id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Datos de la Solicitud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Restaurante</Label>
                <p className="text-sm">{request.restaurant?.name || 'Restaurante no encontrado'}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Nombre Completo</Label>
                <p className="text-sm">{request.full_name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Razón Social</Label>
                <p className="text-sm">{request.legal_name}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">NIF/CIF/NIE</Label>
                <p className="text-sm font-mono">{request.tax_id}</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado:</span>
                {getStatusBadge(request.status)}
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Creada: {new Date(request.created_at).toLocaleString('es-ES')}
                </span>
              </div>

              {request.moderated_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Moderada: {new Date(request.moderated_at).toLocaleString('es-ES')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Moderation Notes */}
        {request.moderation_notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notas de Moderación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{request.moderation_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Document Links (if approved) */}
        {request.status === 'approved' && (request.dni_scan_url || request.selfie_url || request.ownership_proof_url) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Verificados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.dni_scan_url && (
                <div>
                  <Label className="text-sm font-medium">DNI/NIE:</Label>
                  <p className="text-sm text-blue-600 break-all">{request.dni_scan_url}</p>
                </div>
              )}
              {request.selfie_url && (
                <div>
                  <Label className="text-sm font-medium">Selfie:</Label>
                  <p className="text-sm text-blue-600 break-all">{request.selfie_url}</p>
                </div>
              )}
              {request.ownership_proof_url && (
                <div>
                  <Label className="text-sm font-medium">Prueba de titularidad:</Label>
                  <p className="text-sm text-blue-600 break-all">{request.ownership_proof_url}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approval Form */}
        {showApprovalForm && (
          <Card>
            <CardHeader>
              <CardTitle>Aprobar Solicitud</CardTitle>
              <CardDescription>
                Complete los enlaces a los documentos verificados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dni-url">URL del DNI/NIE escaneado *</Label>
                <Input
                  id="dni-url"
                  value={dniUrl}
                  onChange={(e) => setDniUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="selfie-url">URL del selfie con documento *</Label>
                <Input
                  id="selfie-url"
                  value={selfieUrl}
                  onChange={(e) => setSelfieUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="ownership-url">URL de prueba de titularidad *</Label>
                <Input
                  id="ownership-url"
                  value={ownershipUrl}
                  onChange={(e) => setOwnershipUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="approval-notes">Notas (opcional)</Label>
                <Textarea
                  id="approval-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas de aprobación..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Form */}
        {showRejectionForm && (
          <Card>
            <CardHeader>
              <CardTitle>Rechazar Solicitud</CardTitle>
              <CardDescription>
                Indique el motivo del rechazo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="rejection-notes">Motivo del rechazo *</Label>
                <Textarea
                  id="rejection-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explique por qué se rechaza la solicitud..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revocation Form */}
        {showRevocationForm && (
          <Card>
            <CardHeader>
              <CardTitle>Revocar Acceso</CardTitle>
              <CardDescription>
                Indique el motivo de la revocación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="revocation-notes">Motivo de la revocación *</Label>
                <Textarea
                  id="revocation-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explique por qué se revoca el acceso..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cerrar
            </Button>

            {request.status === 'pending' && (
              <>
                {showApprovalForm ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowApprovalForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar Aprobación
                    </Button>
                  </>
                ) : showRejectionForm ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectionForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isRejecting}
                    >
                      {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar Rechazo
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowApprovalForm(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectionForm(true)}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
              </>
            )}

            {request.status === 'approved' && (
              <>
                {showRevocationForm ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowRevocationForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRevoke}
                      disabled={isRevoking}
                    >
                      {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar Revocación
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => setShowRevocationForm(true)}
                  >
                    Revocar Acceso
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};