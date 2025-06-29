import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Save, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AvatarUploader } from '@/components/ui/AvatarUploader';
import SpainCitySelector from '@/components/ui/SpainCitySelector';
import { ChangePasswordDialog } from '@/components/ui/ChangePasswordDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { logout } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    city: '',
    cooking_level: '',
    dietary_restrictions: [] as string[],
    favorite_cuisines: [] as string[],
    avatar_url: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameValidation, setUsernameValidation] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isAvailable: null,
    message: ''
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  // Cargar datos del perfil cuando esté disponible
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        city: profile.city || '',
        cooking_level: profile.cooking_level || '',
        dietary_restrictions: profile.dietary_restrictions || [],
        favorite_cuisines: profile.favorite_cuisines || [],
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const validateField = (field: string, value: string | string[]) => {
    let error = '';
    
    switch (field) {
      case 'username':
        if (!value || (typeof value === 'string' && value.trim().length < 3)) {
          error = 'El nombre de usuario debe tener al menos 3 caracteres';
        }
        break;
      case 'bio':
        if (!value || (typeof value === 'string' && value.trim().length < 10)) {
          error = 'La biografía debe tener al menos 10 caracteres';
        }
        break;
      case 'city':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Selecciona tu ciudad';
        }
        break;
      case 'cooking_level':
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = 'Selecciona tu nivel de cocina';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const checkUsernameAvailability = async () => {
    const username = formData.username.trim();
    
    if (!username || username.length < 3) {
      setUsernameValidation({
        isChecking: false,
        isAvailable: null,
        message: 'El nombre de usuario debe tener al menos 3 caracteres'
      });
      return;
    }

    // If username hasn't changed, mark as available
    if (username === profile?.username) {
      setUsernameValidation({
        isChecking: false,
        isAvailable: true,
        message: 'Este es tu nombre de usuario actual'
      });
      return;
    }

    setUsernameValidation({
      isChecking: true,
      isAvailable: null,
      message: 'Verificando disponibilidad...'
    });

    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Error checking username:', error);
        throw error;
      }

      const isAvailable = !data;
      
      setUsernameValidation({
        isChecking: false,
        isAvailable,
        message: isAvailable 
          ? '¡Nombre de usuario disponible!' 
          : 'Este nombre de usuario ya está en uso'
      });
    } catch (error) {
      console.error('Error checking username availability:', error);
      setUsernameValidation({
        isChecking: false,
        isAvailable: false,
        message: 'Error al verificar disponibilidad'
      });
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
    
    // Reset username validation when username changes
    if (field === 'username') {
      setUsernameValidation({
        isChecking: false,
        isAvailable: null,
        message: ''
      });
    }
  };

  const handleAvatarUpload = async (fileId: string) => {
    console.log('📸 Settings: Avatar subido exitosamente:', fileId);
    
    setFormData(prev => ({ ...prev, avatar_url: fileId }));
    
    const updateResult = await updateProfile({ avatar_url: fileId });
    
    if (updateResult) {
      toast({
        title: "¡Avatar actualizado!",
        description: "Tu foto de perfil se ha actualizado correctamente"
      });
    }
  };

  const handleSave = async () => {
    // Validate all fields
    const isUsernameValid = validateField('username', formData.username);
    const isBioValid = validateField('bio', formData.bio);
    const isCityValid = validateField('city', formData.city);
    const isCookingLevelValid = validateField('cooking_level', formData.cooking_level);

    if (!isUsernameValid || !isBioValid || !isCityValid || !isCookingLevelValid) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores antes de guardar",
        variant: "destructive"
      });
      return;
    }

    // Check if username validation is required and completed
    if (formData.username !== profile?.username && usernameValidation.isAvailable !== true) {
      toast({
        title: "Verificación requerida",
        description: "Por favor, verifica la disponibilidad del nombre de usuario antes de guardar",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        toast({
          title: "¡Perfil actualizado!",
          description: "Los cambios se han guardado correctamente"
        });
        // Reset username validation after successful save
        setUsernameValidation({
          isChecking: false,
          isAvailable: null,
          message: ''
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Configuración</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Configuración del Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar using the component with cropping and advanced compression */}
            <div className="flex justify-center">
              <AvatarUploader
                currentFileId={formData.avatar_url}
                onUploadComplete={handleAvatarUpload}
                userId={profile?.id}
                fallbackText={profile?.full_name}
                size="xl"
              />
            </div>

            {/* Names (read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nombre</Label>
                <Input 
                  id="firstName" 
                  value={profile?.first_name || ''} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">No se puede modificar</p>
              </div>
              <div>
                <Label htmlFor="lastName">Apellidos</Label>
                <Input 
                  id="lastName" 
                  value={profile?.last_name || ''} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">No se puede modificar</p>
              </div>
            </div>

            {/* Username with availability check */}
            <div>
              <Label htmlFor="username">Nombre de usuario *</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="tu_nombre_usuario"
                  className={errors.username ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkUsernameAvailability}
                  disabled={usernameValidation.isChecking || !formData.username.trim() || formData.username.length < 3}
                  className="whitespace-nowrap"
                >
                  {usernameValidation.isChecking ? 'Verificando...' : 'Verificar disponibilidad'}
                </Button>
              </div>
              
              {/* Username validation message */}
              {usernameValidation.message && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  usernameValidation.isAvailable === true 
                    ? 'text-green-600' 
                    : usernameValidation.isAvailable === false 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`}>
                  {usernameValidation.isAvailable === true && <Check className="h-4 w-4" />}
                  {usernameValidation.isAvailable === false && <X className="h-4 w-4" />}
                  {usernameValidation.message}
                </div>
              )}
              
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Biografía *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre tu pasión por la cocina..."
                rows={3}
                className={errors.bio ? 'border-red-500' : ''}
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
              )}
            </div>

            {/* Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <SpainCitySelector
                  value={formData.city}
                  onValueChange={(value) => handleInputChange('city', value)}
                  placeholder="Selecciona tu ciudad"
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value="España"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Actualmente solo disponible en España</p>
              </div>
            </div>

            {/* Nivel de cocina */}
            <div>
              <Label htmlFor="cooking_level">Nivel de cocina *</Label>
              <Select value={formData.cooking_level} onValueChange={(value) => handleInputChange('cooking_level', value)}>
                <SelectTrigger className={errors.cooking_level ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona tu nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                  <SelectItem value="professional">Profesional</SelectItem>
                </SelectContent>
              </Select>
              {errors.cooking_level && (
                <p className="text-sm text-red-500 mt-1">{errors.cooking_level}</p>
              )}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones por email</Label>
                <p className="text-sm text-muted-foreground">Recibir actualizaciones por email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones push</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones push</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, push: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Comunicaciones de marketing</Label>
                <p className="text-sm text-muted-foreground">Recibir emails promocionales</p>
              </div>
              <Switch
                checked={notifications.marketing}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacidad y Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChangePasswordDialog />
            <Button variant="outline" className="w-full justify-start">
              Descargar mis Datos
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Eliminar Cuenta
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones de Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout} className="w-full">
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
