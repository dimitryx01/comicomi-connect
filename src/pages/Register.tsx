
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Las contraseñas no coinciden",
        description: "Por favor asegúrate de que las contraseñas sean iguales."
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Manejo específico de errores
        if (error.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Usuario ya registrado",
            description: "Ya existe una cuenta con este email. Prueba iniciando sesión o usa el botón de reenvío de confirmación."
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            variant: "destructive",
            title: "Contraseña muy débil",
            description: "La contraseña debe tener al menos 6 caracteres."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error en el registro",
            description: error.message || "Por favor inténtalo de nuevo."
          });
        }
        return;
      }

      if (data.user) {
        // Verificar si el usuario ya tiene un perfil
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, onboarding_completed')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingUser) {
          // Solo crear perfil si no existe
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              onboarding_completed: false
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }

        toast({
          title: "¡Cuenta creada!",
          description: data.user.email_confirmed_at 
            ? "Tu cuenta está lista. ¡Bienvenido!" 
            : "Te hemos enviado un email de verificación. Por favor revisa tu bandeja de entrada."
        });
      }
    } catch (error: any) {
      console.error('Unexpected registration error:', error);
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "Ha ocurrido un error. Por favor inténtalo de nuevo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex justify-center items-center min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
              <CardDescription className="text-center">
                Únete a la comunidad culinaria de comicomi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Iniciar sesión
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
