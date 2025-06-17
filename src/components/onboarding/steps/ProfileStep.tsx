
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, User } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';
import SpainCitySelector from '@/components/ui/SpainCitySelector';

interface ProfileStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const ProfileStep = ({ data, updateData }: ProfileStepProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        updateData({ avatar_url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateUsername = (firstName: string, lastName: string) => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) return;
    
    const username = fullName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
    updateData({ username });
    
    // Limpiar error de username si existe
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'first_name':
        if (!value.trim()) error = 'El nombre es obligatorio';
        break;
      case 'last_name':
        if (!value.trim()) error = 'Los apellidos son obligatorios';
        break;
      case 'username':
        if (!value.trim()) error = 'El nombre de usuario es obligatorio';
        else if (value.length < 3) error = 'El nombre de usuario debe tener al menos 3 caracteres';
        break;
      case 'bio':
        if (!value.trim()) error = 'La biografía es obligatoria para conocerte mejor';
        else if (value.length < 10) error = 'Cuéntanos un poco más sobre ti (mínimo 10 caracteres)';
        break;
      case 'city':
        if (!value.trim()) error = 'Selecciona tu ciudad';
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
    validateField(field, value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Cuéntanos sobre ti</h2>
        <p className="text-muted-foreground">
          Esta información aparecerá en tu perfil público
        </p>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={data.avatar_url} />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <p className="text-sm text-muted-foreground">Sube tu foto de perfil (opcional)</p>
        </div>

        {/* Nombres separados */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre *</Label>
            <Input
              id="first_name"
              value={data.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Tu nombre"
              required
              className={errors.first_name ? 'border-red-500' : ''}
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">{errors.first_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Apellidos *</Label>
            <Input
              id="last_name"
              value={data.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Tus apellidos"
              required
              className={errors.last_name ? 'border-red-500' : ''}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Nombre de usuario *</Label>
          <div className="flex space-x-2">
            <Input
              id="username"
              value={data.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="nombre_usuario"
              required
              className={errors.username ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => generateUsername(data.first_name, data.last_name)}
              disabled={!data.first_name}
            >
              Generar
            </Button>
          </div>
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Los otros usuarios te encontrarán con este nombre
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Biografía *</Label>
          <Textarea
            id="bio"
            value={data.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Cuéntanos sobre tu pasión por la cocina, tu experiencia culinaria, platos favoritos..."
            rows={3}
            className={errors.bio ? 'border-red-500' : ''}
          />
          {errors.bio && (
            <p className="text-sm text-red-500">{errors.bio}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Ayuda a otros usuarios a conocerte mejor compartiendo tu historia culinaria
          </p>
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad *</Label>
            <SpainCitySelector
              value={data.city}
              onValueChange={(value) => handleInputChange('city', value)}
              placeholder="Selecciona tu ciudad"
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value="España"
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Actualmente solo disponible en España
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;
