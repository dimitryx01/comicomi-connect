
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

  const generateUsername = (fullName: string) => {
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

        {/* Nombre completo */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre completo *</Label>
          <Input
            id="full_name"
            value={data.full_name}
            onChange={(e) => updateData({ full_name: e.target.value })}
            placeholder="Tu nombre completo"
            required
          />
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
              onClick={() => generateUsername(data.full_name)}
              disabled={!data.full_name}
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

        {/* Ubicación */}
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="location"
              value={data.location}
              onChange={(e) => updateData({ location: e.target.value })}
              placeholder="Ciudad, País"
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;
