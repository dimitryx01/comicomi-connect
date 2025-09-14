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
import { User, Building, FileText, Phone, Mail, Calendar, MessageSquare, Upload, ExternalLink } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useOptimizedUpload } from '@/hooks/useOptimizedUpload';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

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
        // Store fileId and generate URL for preview
        const { getSignedMediaUrl } = await import('@/utils/mediaStorage');
        const previewUrl = await getSignedMediaUrl(result.fileId, 3600);
        
        console.log('🔗 Generated preview URL for', type, ':', previewUrl.substring(0, 50) + '...');
        console.log('💾 Storing fileId for', type, ':', result.fileId);

        if (type === 'dni') {
          setDniFileId(result.fileId);
          setDniUrl(previewUrl);
        } else if (type === 'selfie') {
          setSelfieFileId(result.fileId);
          setSelfieUrl(previewUrl);
        } else {
          setOwnershipFileId(result.fileId);
          setOwnershipUrl(previewUrl);
        }
        toast.success('Archivo subido correctamente');
      } else {
        console.error('❌ Upload failed:', result);
        toast.error('Error: No se pudo subir el archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir el archivo');
    }
  };

  const handleApprove = async () => {
    if (!dniFileId || !selfieFileId || !ownershipFileId) {
      toast.error('Todos los documentos son obligatorios para aprobar la solicitud');
      return;
    }

    setIsApproving(true);
    try {
      console.log('🚀 Calling RPC with fileIds:', { dniFileId, selfieFileId, ownershipFileId });
      
      const { data, error } = await supabase.rpc('admin_approve_restaurant_access', {
        request_id: request.id,
        dni_file_id: dniFileId,
        selfie_file_id: selfieFileId,
        ownership_file_id: ownershipFileId,
        notes: notes || null,
        p_admin_user_id: adminUser?.id
      });

      if (error) throw error;
      if (!data) throw new Error('Error al aprobar la solicitud');

      toast.success('Solicitud aprobada correctamente');
      resetAll(); // Reset everything after successful approval
      onUpdate();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error('Error al aprobar la solicitud');
    } finally {
      setIsApproving(false);
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
        p_admin_user_id: adminUser?.id
      });

      if (error) throw error;
      if (!data) throw new Error('Error al rechazar la solicitud');

      toast.success('Solicitud rechazada correctamente');
      resetAll(); // Reset everything after successful rejection
      onUpdate();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error('Error al rechazar la solicitud');
    } finally {
      setIsRejecting(false);
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
        p_admin_user_id: adminUser?.id
      });

      if (error) throw error;
      if (!data) throw new Error('Error al revocar el acceso');

      toast.success('Acceso revocado correctamente');
      resetAll(); // Reset everything after successful revocation
      onUpdate();
    } catch (error: any) {
      console.error('Error revoking access:', error);
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
      // Only reset form visibility, keep uploaded documents
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
                <Label htmlFor="dni-upload">DNI/NIE escaneado *</Label>
                <div className="flex gap-2">
                  <Input
                    id="dni-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDniFile(file);
                        handleFileUpload(file, 'dni');
                      }
                    }}
                    disabled={isUploadingDni}
                  />
                  {isUploadingDni && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {dniUrl && (
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-green-600">✓ DNI subido</p>
                    {dniFile && <span className="text-xs text-muted-foreground">({dniFile.name})</span>}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="selfie-upload">Selfie con documento *</Label>
                <div className="flex gap-2">
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
                  {isUploadingSelfie && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {selfieUrl && (
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-green-600">✓ Selfie subido</p>
                    {selfieFile && <span className="text-xs text-muted-foreground">({selfieFile.name})</span>}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="ownership-upload">Prueba de titularidad *</Label>
                <div className="flex gap-2">
                  <Input
                    id="ownership-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setOwnershipFile(file);
                        handleFileUpload(file, 'ownership');
                      }
                    }}
                    disabled={isUploadingOwnership}
                  />
                  {isUploadingOwnership && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {ownershipUrl && (
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-green-600">✓ Titularidad subida</p>
                    {ownershipFile && <span className="text-xs text-muted-foreground">({ownershipFile.name})</span>}
                  </div>
                )}
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
                      onClick={() => {
                        setShowApprovalForm(false);
                        resetDocuments(); // Reset documents when canceling approval
                      }}
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