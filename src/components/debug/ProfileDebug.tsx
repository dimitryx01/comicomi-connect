import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const ProfileDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const { profile, loading, refetchProfile } = useUserProfile();
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();

  const fixOnboardingStatus = async () => {
    if (!user) return;
    
    setIsFixing(true);
    try {
      // Verificar si el usuario existe en la tabla users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        console.log('Usuario encontrado en la base de datos:', existingUser);
        console.log('Estado actual de onboarding_completed:', existingUser.onboarding_completed);
        
        // Actualizar el estado de onboarding_completed a true
        const { error: updateError } = await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', user.id);

        if (updateError) throw updateError;
        
        toast({
          title: "¡Estado de onboarding actualizado!",
          description: "El estado de onboarding ha sido actualizado a 'completado'."
        });
        
        // Refrescar el perfil
        await refetchProfile();
      } else {
        console.log('Usuario no encontrado en la base de datos');
        toast({
          title: "Usuario no encontrado",
          description: "No se encontró el usuario en la base de datos.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al arreglar el estado de onboarding:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar el estado de onboarding.",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('Probando conexión a Supabase...');
      
      // Verificar la sesión actual
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Sesión actual:', sessionData.session ? 'Válida' : 'Inválida');
      
      // Intentar acceder a la tabla users
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
        
      console.log('Acceso a tabla users - Count:', count, 'Error:', countError ? countError.message : 'Ninguno');
      
      toast({
        title: "Prueba de conexión",
        description: countError 
          ? `Error al acceder a la base de datos: ${countError.message}` 
          : `Conexión exitosa. Registros en users: ${count}`
      });
    } catch (error) {
      console.error('Error al probar la conexión:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar a Supabase. Verifica la consola para más detalles.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Depuración de Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Estado de autenticación:</h3>
          <p>isAuthenticated: {isAuthenticated ? 'Sí' : 'No'}</p>
          <p>User ID: {user?.id || 'No autenticado'}</p>
        </div>
        
        <div>
          <h3 className="font-semibold">Estado de perfil:</h3>
          <p>Loading: {loading ? 'Sí' : 'No'}</p>
          <p>Profile exists: {profile ? 'Sí' : 'No'}</p>
          {profile && (
            <div className="mt-2">
              <p>Username: {profile.username}</p>
              <p>Full name: {profile.full_name}</p>
              <p>Avatar URL: {profile.avatar_url || 'No definido'}</p>
              <p>Onboarding completed: {profile.onboarding_completed ? 'Sí' : 'No'}</p>
              <p>Onboarding completed (raw): {JSON.stringify(profile.onboarding_completed)}</p>
              <p>Onboarding completed (type): {typeof profile.onboarding_completed}</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Ver perfil completo</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={fixOnboardingStatus} 
            disabled={isFixing || !user}
          >
            {isFixing ? 'Arreglando...' : 'Arreglar estado de onboarding'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testDatabaseConnection}
          >
            Probar conexión a base de datos
          </Button>
          
          <Button 
            variant="outline" 
            onClick={refetchProfile}
          >
            Recargar perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};