
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, User } from 'lucide-react';
import { OnboardingData } from '../OnboardingWizard';

interface ProfileStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
}

const ProfileStep = ({ data, updateData }: ProfileStepProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
          <p className="text-sm text-muted-foreground">Sube tu foto de perfil</p>
        </div>

        {/* Nombres separados */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre *</Label>
            <Input
              id="first_name"
              value={data.first_name}
              onChange={(e) => updateData({ first_name: e.target.value })}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Apellidos *</Label>
            <Input
              id="last_name"
              value={data.last_name}
              onChange={(e) => updateData({ last_name: e.target.value })}
              placeholder="Tus apellidos"
              required
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Nombre de usuario *</Label>
          <div className="flex space-x-2">
            <Input
              id="username"
              value={data.username}
              onChange={(e) => updateData({ username: e.target.value })}
              placeholder="nombre_usuario"
              required
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
          <p className="text-sm text-muted-foreground">
            Los otros usuarios te encontrarán con este nombre
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={data.bio}
            onChange={(e) => updateData({ bio: e.target.value })}
            placeholder="Cuéntanos un poco sobre ti y tu pasión por la cocina..."
            rows={3}
          />
        </div>

        {/* Ubicación separada */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="city"
                value={data.city}
                onChange={(e) => updateData({ city: e.target.value })}
                placeholder="Tu ciudad"
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => updateData({ country: e.target.value })}
              placeholder="Tu país"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;
