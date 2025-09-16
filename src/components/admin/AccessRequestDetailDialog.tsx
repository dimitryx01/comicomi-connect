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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building, FileText, Phone, Mail, Calendar, MessageSquare, Upload, ExternalLink, History } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useOptimizedUpload } from '@/hooks/useOptimizedUpload';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { RequestHistorySection } from './RequestHistorySection';

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
  const { adminUser } = useAdminAuth();
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
  
  // Store fileIds separately for the RPC call
  const [dniFileId, setDniFileId] = useState<string>('');
  const [selfieFileId, setSelfieFileId] = useState<string>('');
  const [ownershipFileId, setOwnershipFileId] = useState<string>('');

  // File upload states
  const [dniFile, setDniFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [ownershipFile, setOwnershipFile] = useState<File | null>(null);

  // Upload hooks
  const { uploadFile: uploadDni, uploading: isUploadingDni } = useOptimizedUpload();
  const { uploadFile: uploadSelfie, uploading: isUploadingSelfie } = useOptimizedUpload();
  const { uploadFile: uploadOwnership, uploading: isUploadingOwnership } = useOptimizedUpload();

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

  const handleFileUpload = async (file: File, type: 'dni' | 'selfie' | 'ownership') => {
    try {
      let result;
      if (type === 'dni') {
        result = await uploadDni(file);
      } else if (type === 'selfie') {
        result = await uploadSelfie(file);
      } else {
        result = await uploadOwnership(file);
      }

      console.log('📄 Upload result:', { success: result?.success, fileId: result?.fileId, type });

      if (result?.success && result?.fileId) {
        if (type === 'dni') {
          setDniFileId(result.fileId);
          setDniUrl(result.url || '');
        } else if (type === 'selfie') {
          setSelfieFileId(result.fileId);
          setSelfieUrl(result.url || '');
        } else {
          setOwnershipFileId(result.fileId);
          setOwnershipUrl(result.url || '');
        }

        toast.success(`Archivo ${type} subido correctamente`);
      } else {
        toast.error(`Error al subir el archivo ${type}`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Error al subir el archivo ${type}`);
    }
  };

  const handleApprove = async () => {
    if (!adminUser?.id || !dniFileId || !selfieFileId || !ownershipFileId) {
      toast.error('Faltan documentos por subir');
      return;
    }

    setIsApproving(true);
    try {
      const { data, error } = await supabase.rpc('admin_approve_restaurant_access', {
        request_id: request.id,
        dni_file_id: dniFileId,
        selfie_file_id: selfieFileId,
        ownership_file_id: ownershipFileId,
        notes: notes || null,
        p_admin_user_id: adminUser.id,
      });

      if (error) {
        console.error('Error approving request:', error);
        toast.error('Error al aprobar la solicitud');
        return;
      }

      toast.success('Solicitud aprobada correctamente');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al aprobar la solicitud');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!adminUser?.id || !notes.trim()) {
      toast.error('Las notas son obligatorias para rechazar');
      return;
    }

    setIsRejecting(true);
    try {
      const { data, error } = await supabase.rpc('admin_reject_restaurant_access', {
        request_id: request.id,
        notes: notes,
        p_admin_user_id: adminUser.id,
      });

      if (error) {
        console.error('Error rejecting request:', error);
        toast.error('Error al rechazar la solicitud');
        return;
      }

      toast.success('Solicitud rechazada correctamente');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al rechazar la solicitud');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRevoke = async () => {
    if (!adminUser?.id || !notes.trim()) {
      toast.error('Las notas son obligatorias para revocar');
      return;
    }

    setIsRevoking(true);
    try {
      const { data, error } = await supabase.rpc('admin_revoke_restaurant_access', {
        request_id: request.id,
        notes: notes,
        p_admin_user_id: adminUser.id,
      });

      if (error) {
        console.error('Error revoking request:', error);
        toast.error('Error al revocar el acceso');
        return;
      }

      toast.success('Acceso revocado correctamente');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al revocar el acceso');
    } finally {
      setIsRevoking(false);
    }
  };

  const resetForms = () => {
    setShowApprovalForm(false);
    setShowRejectionForm(false);
    setShowRevocationForm(false);
    setNotes('');
  };

  const resetDocuments = () => {
    setDniUrl('');
    setSelfieUrl('');
    setOwnershipUrl('');
    setDniFileId('');
    setSelfieFileId('');
    setOwnershipFileId('');
    setDniFile(null);
    setSelfieFile(null);
    setOwnershipFile(null);
  };

  const resetAll = () => {
    resetForms();
    resetDocuments();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetAll();
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

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles de la Solicitud</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
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
                      <AvatarImage src={request.requester?.avatar_url} />
                      <AvatarFallback>
                        {(request.requester?.full_name || request.full_name)?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.requester?.full_name || request.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{request.requester?.username || 'sin_usuario'}</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs"
                        onClick={() => window.open(`/profile/${request.requester_user_id}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver perfil
                      </Button>
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{request.restaurant?.name || 'Restaurante no encontrado'}</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs"
                        onClick={() => window.open(`/restaurants/${request.restaurant_id}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver restaurante
                      </Button>
                    </div>
                    {request.restaurant?.address && (
                      <p className="text-xs text-muted-foreground">{request.restaurant.address}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono">ID: {request.restaurant_id}</p>
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

                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>

                  {request.moderated_at && (
                    <div>
                      <Label className="text-sm font-medium">Moderación</Label>
                      <p className="text-xs text-muted-foreground">
                        Moderado el {new Date(request.moderated_at).toLocaleDateString('es-ES')}
                      </p>
                      {request.moderation_notes && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <p className="text-xs">{request.moderation_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Approval Form */}
            {showApprovalForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Documentos Requeridos para Aprobación
                  </CardTitle>
                  <CardDescription>
                    Subir los documentos necesarios antes de aprobar la solicitud
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dni-upload">DNI/NIE/Pasaporte *</Label>
                    <Input
                      id="dni-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setDniFile(file);
                          handleFileUpload(file, 'dni');
                        }
                      }}
                      disabled={isUploadingDni}
                    />
                    {isUploadingDni && (
                      <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Subiendo...</span>
                      </div>
                    )}
                    {dniUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">✓ Archivo subido</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="selfie-upload">Selfie con DNI *</Label>
                    <Input
                      id="selfie-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelfieFile(file);
                          handleFileUpload(file, 'selfie');
                        }
                      }}
                      disabled={isUploadingSelfie}
                    />
                    {isUploadingSelfie && (
                      <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Subiendo...</span>
                      </div>
                    )}
                    {selfieUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">✓ Archivo subido</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ownership-upload">Prueba de Propiedad *</Label>
                    <Input
                      id="ownership-upload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOwnershipFile(file);
                          handleFileUpload(file, 'ownership');
                        }
                      }}
                      disabled={isUploadingOwnership}
                    />
                    {isUploadingOwnership && (
                      <div className="flex items-center gap-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Subiendo...</span>
                      </div>
                    )}
                    {ownershipUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">✓ Archivo subido</p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <Label htmlFor="approval-notes">Notas (opcional)</Label>
                    <Textarea
                      id="approval-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notas adicionales sobre la aprobación..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejection Form */}
            {showRejectionForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Motivo del Rechazo
                  </CardTitle>
                  <CardDescription>
                    Proporciona una explicación clara del motivo del rechazo
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
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Motivo de la Revocación
                  </CardTitle>
                  <CardDescription>
                    Proporciona una explicación clara del motivo de la revocación
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
                          disabled={isApproving || !dniFileId || !selfieFileId || !ownershipFileId}
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
                          disabled={isRejecting || !notes.trim()}
                        >
                          {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Confirmar Rechazo
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="destructive"
                          onClick={() => setShowRejectionForm(true)}
                        >
                          Rechazar
                        </Button>
                        <Button
                          onClick={() => setShowApprovalForm(true)}
                        >
                          Aprobar
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
          </TabsContent>

          <TabsContent value="history">
            <RequestHistorySection
              userId={request.requester_user_id}
              restaurantId={request.restaurant_id}
              currentRequestId={request.id}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};